-- Articles and blog functionality
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  tags text[],
  author_name text,
  author_avatar_url text,
  featured_image_url text,
  thumbnail_url text,
  is_featured boolean default false,
  is_published boolean default false,
  publish_date timestamptz,
  view_count bigint default 0,
  read_time_minutes int,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Article views tracking for analytics
create table article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade not null,
  viewed_at timestamptz default now(),
  viewer_ip text
);

-- Indexes for performance
create index articles_slug_idx on articles(slug);
create index articles_published_idx on articles(is_published, publish_date desc);
create index articles_tags_idx on articles using gin(tags);
create index articles_featured_idx on articles(is_featured) where is_featured = true;
create index article_views_article_id_idx on article_views(article_id, viewed_at desc);
create index article_views_ip_time_idx on article_views(viewer_ip, viewed_at desc);

-- Function to increment article view count
create or replace function increment_article_view_count(
  article_id_param uuid,
  viewer_ip_param text default null
)
returns void as $$
declare
  last_view_time timestamptz;
begin
  -- Check if this IP has viewed this article in the last hour to prevent spam
  if viewer_ip_param is not null then
    select viewed_at into last_view_time
    from article_views
    where article_views.article_id = increment_article_view_count.article_id_param
      and article_views.viewer_ip = increment_article_view_count.viewer_ip_param
      and viewed_at > now() - interval '1 hour'
    limit 1;

    -- If found a recent view, don't count it again
    if last_view_time is not null then
      return;
    end if;
  end if;

  -- Insert the view record
  insert into article_views (article_id, viewer_ip)
  values (increment_article_view_count.article_id_param, viewer_ip_param);

  -- Update the view count on the article
  update articles
  set view_count = view_count + 1,
      updated_at = now()
  where id = increment_article_view_count.article_id_param;
end;
$$ language plpgsql security definer;

-- Function to search articles (full text search)
create or replace function search_articles(
  search_query text,
  limit_count int default 20
)
returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  thumbnail_url text,
  tags text[],
  publish_date timestamptz,
  relevance_rank real
) as $$
begin
  return query
  select
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.thumbnail_url,
    a.tags,
    a.publish_date,
    ts_rank(
      to_tsvector('english', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.content, '')),
      plainto_tsquery('english', search_query)
    ) as relevance_rank
  from articles a
  where a.is_published = true
    and (
      to_tsvector('english', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.content, ''))
      @@ plainto_tsquery('english', search_query)
      or a.tags && string_to_array(lower(search_query), ' ')
    )
  order by relevance_rank desc, a.publish_date desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Function to get popular articles based on recent views
create or replace function get_popular_articles(
  limit_count int default 10,
  days_back int default 30
)
returns table (
  id uuid,
  title text,
  slug text,
  view_count bigint,
  recent_views bigint,
  popularity_score real
) as $$
begin
  return query
  select
    a.id,
    a.title,
    a.slug,
    a.view_count,
    coalesce(recent_view_counts.recent_views, 0) as recent_views,
    (
      coalesce(recent_view_counts.recent_views, 0) * 0.7 +
      (a.view_count * 0.3)
    )::real as popularity_score
  from articles a
  left join (
    select
      av.article_id,
      count(*) as recent_views
    from article_views av
    where av.viewed_at > now() - interval '1 day' * days_back
    group by av.article_id
  ) recent_view_counts on a.id = recent_view_counts.article_id
  where a.is_published = true
  order by popularity_score desc, a.view_count desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Enable RLS on articles tables (articles are public, but views need protection)
alter table articles enable row level security;
alter table article_views enable row level security;

-- Public read access to published articles
create policy "articles_public_read" on articles
  for select using (is_published = true);

-- Article views are protected - only the application can insert
create policy "article_views_app_only" on article_views
  for all using (false);

-- Add some sample articles for testing
insert into articles (
  title,
  slug,
  excerpt,
  content,
  tags,
  author_name,
  author_avatar_url,
  is_featured,
  is_published,
  publish_date,
  read_time_minutes,
  meta_title,
  meta_description
) values (
  'Getting Started with AI Voice Training',
  'getting-started-ai-voice-training',
  'Learn how AI voice agents can revolutionize your sales training program with realistic practice scenarios.',
  '## Introduction

AI voice training represents a paradigm shift in how sales teams develop their skills. By leveraging advanced speech synthesis and natural language processing, teams can practice with AI prospects that respond authentically to every interaction.

## Key Benefits

The primary advantages include:

- **24/7 availability** - Practice anytime without scheduling conflicts
- **Consistent feedback quality** - Objective performance metrics every time
- **Unlimited scenario variety** - Never run out of new challenges
- **Safe learning environment** - Make mistakes without real-world consequences

Unlike traditional role-playing, AI voice training eliminates scheduling conflicts and provides objective performance metrics that help identify specific areas for improvement.

## Implementation Strategy

To maximize effectiveness, follow this proven approach:

1. **Start simple** - Begin with basic scenarios before adding complexity
2. **Focus on specific skills** - Target objection handling, discovery questions, and closing techniques
3. **Set regular practice schedules** - Consistency beats intensity
4. **Review feedback immediately** - Learning is strongest right after practice

## Best Practices

Regular practice sessions, immediate feedback review, and progressive skill building ensure optimal results. Track performance metrics to identify improvement opportunities and celebrate progress.

Key practices include:
- Setting aside dedicated practice time each day
- Reviewing call recordings and feedback
- Gradually increasing scenario difficulty
- Sharing insights with team members

## Getting Started Today

Ready to transform your sales training? Here''s how to begin:

1. Assess your current training gaps
2. Select initial scenarios that match your needs
3. Schedule your first practice session
4. Review results and plan next steps

AI voice training offers unprecedented opportunities for sales skill development. Organizations that embrace this technology will see significant improvements in team performance and confidence.',
  array['AI Training', 'Sales', 'Voice Technology', 'Getting Started'],
  'Sarah Chen',
  'https://images.unsplash.com/photo-1494790108755-2616b612b743?w=40&h=40&fit=crop&crop=face',
  true,
  true,
  now() - interval '2 days',
  8,
  'Getting Started with AI Voice Training | SpeakStride',
  'Discover how AI voice agents can transform your sales training program with realistic practice scenarios and immediate feedback.'
),
(
  'Advanced Objection Handling Techniques',
  'advanced-objection-handling-techniques',
  'Master the art of turning objections into opportunities with proven techniques and AI-powered practice scenarios.',
  '## Understanding Objections

Objections are natural responses that indicate engagement and interest. The key is reframing them as opportunities for deeper conversation and relationship building.

When a prospect raises an objection, they''re actually telling you:
- They''re engaged in the conversation
- They have concerns that need addressing
- They''re considering your solution
- They want more information or reassurance

## The Feel-Felt-Found Method

This classic technique acknowledges the prospect''s concern, relates it to others'' experiences, and presents a solution based on real outcomes.

**How it works:**
1. **Feel**: "I understand how you feel..."
2. **Felt**: "Many of our clients felt the same way..."
3. **Found**: "What they found was..."

This approach validates their concern while providing social proof and a path forward.

## Preparation Strategies

Anticipate common objections and prepare thoughtful responses. Practice with AI scenarios to build confidence and natural delivery.

**Common objections to prepare for:**
- Price concerns
- Timing issues
- Authority questions
- Product fit doubts
- Competitor comparisons

**Preparation checklist:**
- [ ] List your top 10 most common objections
- [ ] Develop 2-3 response strategies for each
- [ ] Practice responses until they feel natural
- [ ] Gather supporting data and case studies

## Advanced Techniques

Learn to use questions to understand underlying concerns, create urgency without pressure, and guide prospects to self-discovery.

**The Question Technique:**
Instead of immediately defending, ask clarifying questions:
- "What specifically concerns you about...?"
- "Help me understand what you mean by...?"
- "What would need to change for this to work?"

**Creating Urgency:**
- Share relevant case studies
- Highlight limited-time opportunities
- Demonstrate cost of inaction
- Use scarcity appropriately

**Guiding Self-Discovery:**
Help prospects convince themselves by asking leading questions that reveal the value of your solution.',
  array['Objection Handling', 'Sales Techniques', 'Advanced Training'],
  'Michael Rodriguez',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  false,
  true,
  now() - interval '5 days',
  12,
  'Advanced Objection Handling Techniques | SpeakStride',
  'Master proven objection handling techniques with AI-powered practice scenarios designed for sales professionals.'
),
(
  'Building Rapport in Voice-Only Conversations',
  'building-rapport-voice-only-conversations',
  'Learn how to establish trust and connection when you can''t rely on visual cues, using voice tone, pace, and active listening.',
  '## Voice Fundamentals

In voice-only interactions, your tone, pace, and energy become the primary tools for connection. Master these elements to build instant rapport.

**Key vocal elements:**
- **Tone**: Warm, friendly, and confident
- **Pace**: Match your prospect''s natural rhythm
- **Energy**: Mirror their enthusiasm level
- **Volume**: Clear but not overwhelming
- **Inflection**: Varied to maintain interest

**Quick tip**: Record yourself during practice calls to identify areas for improvement in your vocal delivery.

## Active Listening Techniques

Demonstrate engagement through verbal affirmations, thoughtful questions, and accurate reflection of what you''ve heard.

**Verbal affirmations:**
- "I understand"
- "That makes sense"
- "Tell me more about that"
- "I can see why that''s important"

**Reflection techniques:**
- Paraphrase what you heard
- Summarize key points
- Ask clarifying questions
- Acknowledge emotions

**Example:**
*Prospect*: "We''ve had issues with our current vendor not responding quickly to support requests."
*You*: "So timely support response is crucial for your operations. What kind of response time would be ideal for your team?"

## Mirroring and Matching

Subtly match your prospect''s communication style, speaking pace, and energy level to create subconscious connection.

**What to mirror:**
- Speaking pace (fast vs. slow)
- Energy level (high vs. low)
- Communication style (formal vs. casual)
- Technical language usage
- Decision-making approach

**What NOT to mirror:**
- Accents or speech patterns
- Negative emotions
- Inappropriate language
- Personal mannerisms

**Best practices:**
- Keep mirroring subtle and natural
- Focus on communication style, not personality
- Adjust gradually over the conversation
- Stay authentic to your own personality

## Trust Building Strategies

Use transparency, vulnerability, and genuine interest to establish credibility and emotional connection quickly.

**Transparency techniques:**
- Share relevant experiences
- Admit when you don''t know something
- Explain your process clearly
- Be honest about limitations

**Building credibility:**
- Reference specific examples
- Use data and case studies
- Demonstrate industry knowledge
- Follow through on commitments

**Showing genuine interest:**
- Ask thoughtful follow-up questions
- Remember details from previous conversations
- Research their company beforehand
- Focus on their challenges, not your product

Remember: People buy from people they trust. In voice-only conversations, trust must be built entirely through your words, tone, and genuine interest in helping solve their problems.',
  array['Rapport Building', 'Voice Communication', 'Trust'],
  'Emma Thompson',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
  false,
  true,
  now() - interval '1 week',
  10,
  'Building Rapport in Voice-Only Conversations | SpeakStride',
  'Learn essential techniques for building trust and connection in voice-only sales conversations.'
);