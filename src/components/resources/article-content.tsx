"use client"

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { Linkedin, LucideIcon, Twitter, Clock, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { formatReadTime, formatPublishDate } from '@/lib/articles'
import type { Article } from '@/types/article'

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface BreadcrumbBlogProps {
  breadcrumb: Array<BreadcrumbItem>;
}

interface AuthorType {
  image?: string;
  name: string;
  job: string;
  description: string;
  socials: {
    icon: LucideIcon;
    url: string;
  }[];
}

interface ArticleContentProps {
  article: Article
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Extract headings from markdown content for table of contents
  const extractHeadings = (content: string) => {
    if (!content) return []

    // Extract ## headings from markdown
    const headingRegex = /^## (.+)$/gm
    const headings: { id: string; text: string; level: number }[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[1].trim()
      const id = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

      headings.push({ id, text, level: 2 })
    }

    return headings
  }

  const headings = extractHeadings(article.content || '')

  useEffect(() => {
    // Set current URL on client side
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    // Query all h2 elements with IDs that match the chapter anchors
    const chapterIds = headings.map(h => h.id)
    const headingElements = chapterIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "0px 0px -30% 0px",
        threshold: 0.1,
      },
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const author: AuthorType = {
    image: article.author_avatar_url || undefined,
    name: article.author_name || "Anonymous",
    job: "Content Contributor",
    description: "Passionate about sharing knowledge and insights in AI voice training and sales automation.",
    socials: [
      {
        icon: Twitter,
        url: "#",
      },
      {
        icon: Linkedin,
        url: "#",
      },
    ],
  }

  const breadcrumb: Array<BreadcrumbItem> = [
    {
      label: "Resources",
      link: "/resources",
    },
    {
      label: "Articles",
      link: "/resources",
    },
  ]

  const shareLinks = [
    {
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
  ]

  return (
    <section className="pb-32">
      <div className="bg-muted bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/dot-pattern-2.svg')] bg-[length:3.125rem_3.125rem] bg-repeat py-20">
        <div className="container flex flex-col items-start justify-start gap-16 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full flex-col items-center justify-center gap-12">
            <div className="flex w-full max-w-[36rem] flex-col items-center justify-center gap-8">
              <BreadcrumbBlog breadcrumb={breadcrumb} />
              <div className="flex w-full flex-col gap-5">
                <div className="text-muted-foreground flex items-center justify-center gap-2.5 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatReadTime(article.read_time_minutes)}
                  </div>
                  <div>|</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatPublishDate(article.publish_date)}
                  </div>
                </div>
                <h1 className="text-center text-[2.5rem] font-semibold leading-[1.2] md:text-5xl lg:text-6xl">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-foreground text-center text-xl font-semibold leading-[1.4]">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2.5">
                  {shareLinks.map((link, index) => (
                    <Button asChild key={`share-link-${index}`} size="icon">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container pt-20">
        <div className="relative mx-auto w-full max-w-5xl items-start justify-between gap-20 lg:flex">
          {/* Chapters */}
          {headings.length > 0 && (
            <div className="bg-background top-20 flex-1 pb-10 lg:sticky lg:pb-0">
              <div className="text-xl font-medium leading-snug">Chapters</div>
              <div className="flex flex-col gap-2 pl-2 pt-2">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(heading.id);
                      if (element) {
                        element.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    className={`text-left text-muted-foreground block text-sm font-medium leading-normal transition duration-300 hover:text-foreground ${
                      activeId === heading.id ? "lg:bg-muted lg:!text-primary lg:rounded-md lg:p-2 lg:font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex w-full max-w-[40rem] flex-col gap-10">
            <Author author={author} />

            {/* Article Content */}
            {article.content && (
              <div className="prose dark:prose-invert prose-headings:scroll-mt-24">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h2: ({ children, ...props }) => {
                      const text = String(children)
                      const id = text.toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

                      return (
                        <h2 id={id} className="scroll-mt-24" {...props}>
                          {children}
                        </h2>
                      )
                    },
                    img: ({ src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt}
                        className="w-full max-w-[40rem] overflow-hidden size-full object-cover object-center rounded-lg"
                        {...props}
                      />
                    ),
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Conclusion */}
            <div className="prose dark:prose-invert bg-muted rounded-lg p-5 [&>h2]:mt-0">
              <h2>Conclusion</h2>
              <p>
                This article provides valuable insights into best practices and proven strategies.
                Continue implementing these techniques to achieve better results and stay ahead
                in your field.
              </p>
            </div>

            {/* Author */}
            <div className="bg-muted flex flex-col gap-4 rounded-lg p-5">
              <Author author={author} />
              <p>{author.description}</p>
              <div className="flex items-center gap-2.5">
                {author.socials.map((link, index) => (
                  <Button asChild key={`author-socials-${index}`} size="icon">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <link.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Author = ({ author }: { author: AuthorType }) => {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-12 border">
        <AvatarImage src={author.image} alt={author.name} />
        <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div>
        <div className="text-sm font-normal leading-normal">{author.name}</div>
        <div className="text-muted-foreground text-sm font-normal leading-normal">
          {author.job}
        </div>
      </div>
    </div>
  );
};

const BreadcrumbBlog = ({ breadcrumb }: BreadcrumbBlogProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((item, i) => {
          return (
            <Fragment key={`${item.label}`}>
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
              {i < breadcrumb.length - 1 ? (
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
              ) : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};