"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Link2, Check, Twitter, Linkedin, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
  className?: string
}

export function ShareButtons({ title, url, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || title)
  const encodedUrl = encodeURIComponent(fullUrl)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const openShareWindow = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform]
    window.open(
      shareUrl,
      'share',
      'width=600,height=400,left=' + (window.innerWidth / 2 - 300) + ',top=' + (window.innerHeight / 2 - 200)
    )
  }

  return (
    <Card className={cn("border-0 shadow-lg bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Share2 className="w-4 h-4" />
          Share Article
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openShareWindow('twitter')}
                    className="flex items-center justify-center p-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openShareWindow('linkedin')}
                    className="flex items-center justify-center p-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openShareWindow('facebook')}
                    className="flex items-center justify-center p-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Facebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Copy Link Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className={cn(
              "w-full flex items-center gap-2 transition-all duration-200",
              copied
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-50"
                : "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
            )}
          >
            <motion.div
              initial={false}
              animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </motion.div>
            <span className="text-xs">
              {copied ? 'Link Copied!' : 'Copy Link'}
            </span>
          </Button>

          {/* URL Display */}
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground break-all font-mono">
              {fullUrl}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}