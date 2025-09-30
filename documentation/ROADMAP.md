# Voice AI Training Platform – Development Roadmap

## Overview

This roadmap outlines the phased development approach for building the Voice AI Training platform. Each phase builds on the previous one, with clear milestones and acceptance criteria.

## Timeline and Status

**Current Status**: Phase 2 Complete, Phase 3 In Progress
**Last Updated**: September 29, 2025

---

## Phase 0: Planning and Architecture (COMPLETE ✅)

**Duration**: 2 weeks
**Status**: Complete

### Goals
- Define product requirements and user flows
- Design system architecture and tech stack
- Create database schema and RLS policies
- Set up development environment

### Deliverables
- ✅ PRD.md with complete feature specifications
- ✅ Architecture.md with system design
- ✅ Database migrations 0001-0004
- ✅ Repository setup with Next.js 15, TypeScript, Supabase
- ✅ Development tooling (ESLint, Prettier, TypeScript configs)

---

## Phase 1: Foundation (COMPLETE ✅)

**Duration**: 3 weeks
**Status**: Complete

### Goals
- Implement authentication and authorization
- Build app shell and navigation
- Set up billing infrastructure
- Create base UI component library

### Deliverables
- ✅ Clerk authentication with JWT claims (org_id, role)
- ✅ RLS policies enforcing org-scoped data access
- ✅ Middleware for route protection
- ✅ Stripe integration for subscriptions
- ✅ AppSidebar with role-based navigation
- ✅ CommandMenu (Cmd+K) for global search
- ✅ ShadCN/UI component library setup
- ✅ Loading states and empty state components
- ✅ Dark mode support

### Acceptance Criteria
- ✅ Users can sign up and be assigned to organizations
- ✅ Role-based access control enforced at DB and UI levels
- ✅ Subscription plans can be selected and managed
- ✅ Navigation works seamlessly across all authenticated routes

---

## Phase 2: Dashboard and UX (COMPLETE ✅)

**Duration**: 2 weeks
**Status**: Complete

### Goals
- Build role-specific dashboard views
- Implement settings pages
- Create design system documentation
- Polish UI/UX across the platform

### Deliverables
- ✅ TraineeOverview dashboard with personal stats
- ✅ ManagerOverview with team performance metrics
- ✅ AdminOverview with org-wide analytics
- ✅ HROverview with compliance tracking
- ✅ Settings pages (Profile, Preferences, Webhooks)
- ✅ Design system documentation page
- ✅ Responsive layouts for mobile, tablet, desktop
- ✅ Loading skeletons for all data-heavy views

### Acceptance Criteria
- ✅ Each role sees appropriate dashboard on login
- ✅ Settings are persisted and applied correctly
- ✅ UI is consistent across all pages
- ✅ Performance: dashboards load in <2 seconds

---

## Phase 3: Content and Assignment (IN PROGRESS 🚧)

**Duration**: 4 weeks
**Status**: 60% Complete

### Goals
- Implement scenario authoring and management
- Build track and curriculum system
- Create assignment workflow
- Develop training hub for trainees

### Deliverables
- ✅ Scenario CRUD operations
- ✅ Scenario form with persona, prompt, rubric editors
- 🚧 Track creation and scenario ordering
- 🚧 Assignment creation with due dates and targets
- 🚧 Trainee training hub with active/upcoming sessions
- 🚧 Assignment notifications and reminders
- ✅ Articles/knowledge base system
- 🚧 Scenario preview and testing mode

### Acceptance Criteria
- Admins can create, edit, publish, and archive scenarios
- Managers can create tracks and assign to team members
- Trainees see assigned content on their dashboard
- Email notifications sent for new assignments and due dates
- Search works across scenarios and tracks

### Current Sprint Focus
- Complete track management UI
- Build assignment creation flow
- Implement trainee training hub
- Add notification system

---

## Phase 4: Voice MVP (PENDING ⏳)

**Duration**: 5 weeks
**Target Start**: October 15, 2025

### Goals
- Integrate Vapi for voice calls
- Implement call session management
- Build scoring and KPI engine
- Create attempt review interface

### Deliverables
- Voice session player with mic permissions
- Vapi agent configuration per scenario
- Call start/end API endpoints
- Real-time call status updates
- Recording and transcript storage
- Basic KPI computation (talk/listen ratio, filler words, pace)
- Scoring engine with rubric weights
- Attempt review page with playback
- Feedback generation with AI

### Acceptance Criteria
- Trainees can start voice sessions from assigned scenarios
- Calls connect reliably with <3 second latency
- Recordings and transcripts saved to Supabase Storage
- Scores calculated accurately based on rubric
- Feedback is actionable and references specific transcript moments
- Attempt history shows all completed sessions

### Technical Requirements
- Vapi Web SDK integration
- WebRTC audio streaming
- STT via Deepgram
- TTS via ElevenLabs
- LLM integration for AI conversation
- Signed URLs for recordings (TTL: 1 hour)

---

## Phase 5: Reporting v1 (PENDING ⏳)

**Duration**: 3 weeks
**Target Start**: November 20, 2025

### Goals
- Implement analytics dashboards
- Build leaderboard system
- Create export functionality
- Enable HR compliance reporting

### Deliverables
- Org overview dashboard with key metrics
- Scenario insights with performance trends
- Team leaderboard (weekly, monthly, all-time)
- CSV export for attempts, users, scores
- Scheduled email reports
- HR compliance view (completion rates, certifications)
- Performance charts (line, bar, pie)
- Filters and drill-down capabilities

### Acceptance Criteria
- Dashboards refresh automatically when new data arrives
- Leaderboard updates in real-time
- Exports complete in <10 seconds for 10k records
- Charts render smoothly on all devices
- Materialized views refresh nightly or on-demand
- HR can track training completion per employee

### Data Pipeline
- Fact tables populated via triggers on attempt completion
- Materialized views for fast dashboard queries
- Indexes on org_id, date_key, user_id, scenario_id
- Scheduled cron job for MV refresh

---

## Phase 6: AI Authoring and Branching (PENDING ⏳)

**Duration**: 4 weeks
**Target Start**: December 11, 2025

### Goals
- Build AI-powered scenario generator
- Implement branching conversation logic
- Add rubric suggestion engine
- Create advanced authoring tools

### Deliverables
- Scenario generator from natural language brief
- Branching editor with visual graph
- Runtime dispatcher for conditional prompts
- Rubric suggestions based on scenario type
- Persona library with templates
- Scenario testing and validation tools
- A/B testing framework for scenarios

### Acceptance Criteria
- Admins can generate scenario drafts in <30 seconds
- Branching logic executes correctly during calls
- Rubrics are contextually relevant to scenario goals
- Generated content is reviewed before publishing
- Scenario quality improves iteratively with feedback

### AI Components
- GPT-4 for scenario generation
- Prompt templates for different industries
- Rubric templates by role and difficulty
- Quality scoring for generated content

---

## Phase 7: Integrations (PENDING ⏳)

**Duration**: 3 weeks
**Target Start**: January 8, 2026

### Goals
- Enhance webhook system
- Add Slack and email notifications
- Build integration marketplace
- Enable data import/export

### Deliverables
- Webhook manager UI with test/replay
- Delivery retry logic with exponential backoff
- HMAC signature verification
- Slack integration for team notifications
- Email templates for all events
- Integration marketplace (Salesforce, HubSpot, etc.)
- Zapier/Make.com connectors
- Bulk user import via CSV

### Acceptance Criteria
- Webhooks deliver reliably with 99.9% success rate
- Failed deliveries retry up to 5 times
- Slack notifications customizable per team
- Email templates branded and mobile-responsive
- Data imports validated and rolled back on error

### Event Types
- scenario.assigned
- scenario.completed
- attempt.scored.low (threshold configurable)
- track.completed
- user.added
- user.promoted
- assignment.overdue

---

## Phase 8: Scale and Security (PENDING ⏳)

**Duration**: 4 weeks
**Target Start**: January 29, 2026

### Goals
- Load testing and optimization
- Security audit and penetration testing
- SLO definition and monitoring
- Team and manager scoping

### Deliverables
- Load tests for 10k concurrent users
- Query optimization and caching
- CDN for static assets
- Rate limiting on API endpoints
- Security audit report and remediation
- Penetration test results
- SLO dashboard (uptime, latency, error rate)
- Alerts for critical metrics
- Team management for large orgs (500+ users)
- Manager scoping (view only assigned teams)

### Acceptance Criteria
- Platform handles 10k concurrent voice sessions
- API response times <200ms p95
- Uptime >99.95%
- Security vulnerabilities addressed
- All secrets rotated and in secure storage
- PII encrypted at rest and in transit

### Performance Targets
- Dashboard load: <2s
- Scenario list: <500ms
- Attempt detail: <1s
- Voice session start: <3s
- Recording playback: <1s

---

## Post-Launch: Continuous Improvement

### Ongoing Initiatives
- Feature requests from customers
- Industry-specific scenario packs
- Mobile apps (iOS, Android)
- Advanced analytics (ML insights)
- Multilingual support
- Voice cloning for personas
- Real-time coaching during calls
- Gamification and badges

### Metrics to Track
- Monthly Active Users (MAU)
- Scenarios completed per user
- Average session score
- User retention rate
- Net Promoter Score (NPS)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

---

## Risk Management

### Technical Risks
- **Vapi API changes**: Mitigate with adapter pattern, monitor changelog
- **Supabase limits**: Upgrade plan proactively, implement caching
- **AI hallucinations**: Validate generated content, human review loop
- **WebRTC reliability**: Fallback to recorded upload if live fails

### Business Risks
- **Slow adoption**: Pilot program with key customers, iterate quickly
- **Competitor parity**: Differentiate on quality of scenarios and feedback
- **Regulatory compliance**: Legal review for GDPR, CCPA, SOC 2

### Dependencies
- Clerk for auth (backup: Auth.js)
- Stripe for billing (backup: Paddle)
- Vapi for voice (backup: Twilio + custom stack)
- Supabase for database (backup: self-hosted Postgres)

---

## Release Strategy

### Beta (Phase 4 Complete)
- Invite-only for 10 pilot customers
- Limited to 50 users per org
- Voice sessions limited to 5/day per user
- Feedback loop via weekly calls

### General Availability (Phase 7 Complete)
- Public launch with pricing tiers
- Unlimited users on Enterprise plan
- Self-service onboarding
- Knowledge base and support portal

### Pricing Tiers
- **Starter**: $49/mo, 10 users, 100 sessions/mo
- **Professional**: $199/mo, 50 users, 500 sessions/mo
- **Enterprise**: Custom, unlimited users and sessions

---

## Success Metrics

### Phase 3 (Current)
- 50 scenarios created across pilot orgs
- 200 assignments distributed
- 80% completion rate on required assignments

### Phase 4 (Voice MVP)
- 1,000 voice sessions completed
- Average score >70
- <5% technical failure rate
- 90% user satisfaction with feedback quality

### Phase 5 (Reporting)
- Dashboards used daily by 80% of managers
- 100 reports exported per month
- Leaderboards viewed 500 times per week

### Phase 6-8
- 10,000 sessions per month across all orgs
- 500 active organizations
- $500k MRR
- 4.5+ star rating on G2/Capterra

---

## Version History

- **v0.3** (Sep 29, 2025) - Phase 2 complete, Phase 3 in progress
- **v0.2** (Sep 15, 2025) - Phase 1 complete, updated with UI components
- **v0.1** (Aug 20, 2025) - Initial roadmap created