# Operations Runbooks

## Overview

This document provides step-by-step procedures for common operational tasks, incident response, and troubleshooting. Use these runbooks during outages, deployments, and routine maintenance.

**On-Call Rotation**: Check PagerDuty schedule
**Escalation**: Slack #incidents channel
**Status Page**: status.voiceaitraining.com

**Last Updated**: September 29, 2025

---

## Incident Response

### Severity Levels

**P0 - Critical** (Page immediately)
- Complete service outage
- Data breach or security incident
- Payment processing down
- Response SLA: Immediate

**P1 - High** (Alert on-call)
- Partial outage (>25% of users affected)
- Authentication failures
- Database connectivity issues
- Response SLA: <30 minutes

**P2 - Medium** (Create ticket)
- Performance degradation
- Non-critical feature broken
- Elevated error rates
- Response SLA: <4 hours

**P3 - Low** (Backlog)
- Minor UI bugs
- Documentation errors
- Feature requests
- Response SLA: <24 hours

---

### P0: Complete Service Outage

**Symptoms**:
- Health check endpoint returning 500
- Users cannot access dashboard
- Vercel deployment status: down

**Immediate Actions**:

1. **Acknowledge incident**:
   ```bash
   # In Slack #incidents
   /incident acknowledge "Site down - investigating"
   ```

2. **Check Vercel status**:
   - Visit https://vercel.com/status
   - Check project dashboard for errors

3. **Check Supabase status**:
   - Visit https://status.supabase.com
   - Check project health in dashboard

4. **Review recent deployments**:
   ```bash
   # Check last 5 deployments
   vercel ls voiceaitraining --count 5
   ```

5. **If deployment caused issue, rollback**:
   ```bash
   # Get previous deployment ID
   vercel ls voiceaitraining

   # Promote previous deployment
   vercel promote <deployment-url> --yes
   ```

6. **If database issue, check RDS metrics**:
   - CPU usage >90%?
   - Connection count maxed out?
   - Disk space <10%?

7. **Update status page**:
   ```
   Title: Service Outage
   Status: Investigating
   Message: We're aware of an issue preventing access to the platform. Investigating now.
   ```

8. **Communicate to customers** (if >15 min):
   - Email all org admins
   - Post on status page
   - Update every 30 minutes

**Resolution**:
- Once fixed, monitor for 15 minutes
- Update status page: "Resolved"
- Send all-clear email
- Schedule post-mortem within 24 hours

---

### P1: Authentication Failures

**Symptoms**:
- Users reporting "Session expired" errors
- Clerk dashboard showing errors
- `/api/webhooks/clerk` failing

**Troubleshooting**:

1. **Check Clerk status**:
   - https://status.clerk.com

2. **Verify environment variables**:
   ```bash
   vercel env ls production
   # Ensure CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY are set
   ```

3. **Check Clerk webhook endpoint**:
   ```bash
   curl -X POST https://app.voiceaitraining.com/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'

   # Expected: 200 OK or 401 (invalid signature)
   # If 404: webhook endpoint not deployed
   ```

4. **Verify JWT claims**:
   - Check Clerk Dashboard > JWT Templates
   - Ensure "org_id" and "role" claims are configured

5. **Test authentication flow**:
   - Try signing in with test account
   - Check browser console for errors
   - Verify JWT in browser DevTools (Application > Cookies)

6. **If webhook issue**:
   - Check Clerk Dashboard > Webhooks > Delivery logs
   - Retry failed deliveries manually

**Mitigation**:
- If Clerk is down, show maintenance page
- No workaround available (external dependency)

---

### P1: Database Connection Errors

**Symptoms**:
- "Too many connections" errors
- Queries timing out
- Supabase dashboard showing red metrics

**Troubleshooting**:

1. **Check connection pool**:
   ```sql
   select count(*) from pg_stat_activity where state = 'active';
   -- If >100, connections are leaking
   ```

2. **Kill idle connections**:
   ```sql
   select pg_terminate_backend(pid)
   from pg_stat_activity
   where state = 'idle'
     and state_change < now() - interval '10 minutes';
   ```

3. **Check slow queries**:
   ```sql
   select pid, now() - query_start as duration, query
   from pg_stat_activity
   where state = 'active'
   order by duration desc
   limit 10;
   ```

4. **Kill long-running query** (if identified):
   ```sql
   select pg_terminate_backend(12345); -- Replace with PID
   ```

5. **Upgrade Supabase plan** (if persistent):
   - Pro plan: 60 connections
   - Team plan: 120 connections
   - Enterprise: Unlimited

6. **Add connection pooling** (PgBouncer):
   - Configure in `DATABASE_URL` connection string
   - Use `?pgbouncer=true` query parameter

**Prevention**:
- Ensure all database clients properly close connections
- Use `unstable_cache` in Next.js to reduce queries
- Add `statement_timeout` to prevent runaway queries

---

## Deployments

### Production Deployment

**Pre-Deployment Checklist**:
- [ ] All tests passing on `main` branch
- [ ] Staging deployed and tested
- [ ] Database migrations applied (if any)
- [ ] Feature flags configured (if new feature)
- [ ] Team notified in #deploys channel

**Deployment Process**:

1. **Merge to `main`**:
   ```bash
   git checkout main
   git pull origin main
   # Vercel auto-deploys on push to main
   ```

2. **Monitor deployment**:
   - Watch Vercel dashboard: https://vercel.com/voiceaitraining
   - Deployment takes ~3 minutes

3. **Verify deployment**:
   ```bash
   # Check health endpoint
   curl https://app.voiceaitraining.com/api/health
   # Expected: {"status":"ok"}

   # Check version
   curl https://app.voiceaitraining.com/api/version
   # Should match latest commit hash
   ```

4. **Smoke test critical paths**:
   - [ ] Sign in works
   - [ ] Dashboard loads
   - [ ] Scenario list shows
   - [ ] Settings page accessible

5. **Monitor errors** (15 minutes):
   - Sentry dashboard: https://sentry.io/voiceaitraining
   - Check for new error spikes

**Rollback Procedure**:

If deployment introduces critical bug:

```bash
# Get previous deployment URL
vercel ls voiceaitraining

# Promote previous deployment
vercel promote <previous-deployment-url> --yes

# Notify team
# Post in #deploys: "Rolled back to previous deployment due to [issue]"
```

---

### Database Migrations

**Running Migrations**:

1. **Backup database first**:
   - Supabase auto-backups daily
   - For extra safety, manual backup via dashboard

2. **Apply migration via Supabase CLI**:
   ```bash
   # Test on local instance first
   supabase db reset

   # Apply to production
   supabase db push --project-ref <project-id>
   ```

3. **Verify migration**:
   ```sql
   -- Check migration applied
   select * from supabase_migrations.schema_migrations
   order by version desc
   limit 5;
   ```

4. **Test affected queries**:
   - If added table, test insert/select
   - If added index, verify query plan improved
   - If changed column, test reads/writes

**Rollback Migration**:

If migration breaks production:

```bash
# Restore from backup
# Go to Supabase Dashboard > Backups > Restore

# Or manually revert via SQL
psql $DATABASE_URL < rollback.sql
```

---

## Routine Maintenance

### Weekly Tasks

**Monday Morning**:
- [ ] Review Sentry errors from previous week
- [ ] Check Supabase disk usage
- [ ] Verify backup completion
- [ ] Review pending security updates

**Commands**:
```bash
# Check disk usage
select pg_size_pretty(pg_database_size(current_database()));

# Check for unused indexes
select schemaname, tablename, indexname, idx_scan
from pg_stat_user_indexes
where idx_scan = 0
  and indexrelname not like '%_pkey';
```

---

### Monthly Tasks

**First Friday of Month**:
- [ ] Rotate API keys (Stripe, Vapi, OpenAI)
- [ ] Review and archive old exports
- [ ] Update dependencies
- [ ] Run security audit

**Dependency Updates**:
```bash
# Check for outdated packages
pnpm outdated

# Update patch versions (safe)
pnpm update

# Review and update major versions manually
pnpm add react@latest react-dom@latest
```

**Security Audit**:
```bash
# Check for vulnerabilities
pnpm audit

# Fix auto-fixable issues
pnpm audit --fix
```

---

### Quarterly Tasks

**Every Quarter**:
- [ ] Review and optimize slow queries
- [ ] Refresh materialized views manually
- [ ] Archive old scenario attempts (>1 year)
- [ ] Penetration test (hire external firm)
- [ ] DR drill (test backup restore)

**Archive Old Attempts**:
```sql
-- Move attempts >1 year old to archive table
insert into scenario_attempts_archive
select * from scenario_attempts
where ended_at < now() - interval '1 year';

delete from scenario_attempts
where ended_at < now() - interval '1 year';

vacuum full scenario_attempts;
```

---

## Monitoring and Alerts

### Key Metrics to Monitor

**Application**:
- Request rate (RPM)
- Error rate (% of 5xx responses)
- Response time (p95)
- Active users (concurrent sessions)

**Database**:
- Connection count
- Query latency (avg, p95)
- Disk usage (% of total)
- Replication lag (if using replicas)

**External Services**:
- Vapi API latency
- Stripe webhook delivery success rate
- Clerk authentication success rate

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | >1% | >5% |
| API p95 latency | >1s | >3s |
| Database connections | >70% | >90% |
| Disk usage | >70% | >85% |
| Voice call failures | >5% | >20% |

**Setting Up Alerts** (Vercel):
```bash
# Install Vercel CLI
npm i -g vercel

# Add monitoring
vercel monitor add \
  --metric error-rate \
  --threshold 0.05 \
  --window 5m \
  --action alert-pagerduty
```

---

## Disaster Recovery

### Backup Strategy

**Automated Backups**:
- Database: Daily via Supabase (retained 7 days on Pro plan)
- File storage: Versioned via Supabase Storage
- Code: Git repository (GitHub)

**Manual Backup** (before risky operation):
```bash
# Database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
gunzip -c backup.sql.gz | head -n 50
```

### Recovery Procedures

**Restore Database**:
```bash
# From Supabase dashboard
# Go to Settings > Database > Point in Time Recovery

# Or from manual backup
psql $DATABASE_URL < backup_20250929.sql
```

**Restore File**:
```bash
# Download from Supabase Storage
supabase storage download recordings/<org-id>/<file>.mp3

# Re-upload if needed
supabase storage upload recordings/<org-id>/<file>.mp3 ./local-file.mp3
```

### DR Drill Checklist

**Quarterly drill to ensure recovery works**:

1. [ ] Take manual backup of production DB
2. [ ] Create test Supabase project
3. [ ] Restore backup to test project
4. [ ] Deploy app pointing to test DB
5. [ ] Verify data integrity
6. [ ] Document any issues found
7. [ ] Update runbooks

---

## Common Issues and Solutions

### Issue: High Memory Usage

**Symptom**: Vercel functions timing out, OOM errors

**Solution**:
1. Check for memory leaks in code
2. Optimize large data fetches (add pagination)
3. Clear caches periodically
4. Upgrade Vercel plan for more memory

---

### Issue: Slow Dashboard Load

**Symptom**: Dashboard takes >5 seconds to load

**Solution**:
1. Refresh materialized views: `select refresh_reporting_views();`
2. Add indexes on frequently queried columns
3. Cache dashboard data (Redis or Next.js cache)
4. Lazy load non-critical widgets

---

### Issue: Voice Calls Failing

**Symptom**: Users can't start or complete voice calls

**Solution**:
1. Check Vapi status: https://status.vapi.ai
2. Verify VAPI_API_KEY is correct
3. Check browser mic permissions
4. Test with different browser/device
5. Review `/api/webhooks/vapi` logs

---

### Issue: Emails Not Sending

**Symptom**: Users not receiving assignment/feedback emails

**Solution**:
1. Check Resend dashboard for failures
2. Verify EMAIL_FROM domain is verified
3. Check SPF/DKIM DNS records
4. Review email queue (if using background jobs)
5. Test with personal email first

---

## On-Call Procedures

### When You're On-Call

**Preparation**:
- Install PagerDuty mobile app
- Test alert delivery
- Have laptop accessible 24/7
- Know escalation contacts

**During Incident**:
1. Acknowledge alert within 5 minutes
2. Post in #incidents channel
3. Follow runbook for incident type
4. Escalate if unsure or stuck >30 minutes
5. Keep team updated every 30 minutes
6. Document all actions taken

**After Incident**:
- Write post-mortem within 24 hours
- Update runbooks with learnings
- Create tickets for follow-up work

---

## Post-Mortem Template

**Incident**: [Short description]
**Date/Time**: [When it occurred]
**Duration**: [How long until resolved]
**Severity**: [P0/P1/P2/P3]
**Impact**: [How many users affected]

**Timeline**:
- [Time] - Incident detected
- [Time] - On-call paged
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Incident resolved

**Root Cause**:
[What caused the incident]

**Resolution**:
[How it was fixed]

**Action Items**:
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]
- [ ] [Update runbook]

---

## Useful Commands

### Database

```bash
# Connect to prod DB
psql $DATABASE_URL

# Check table sizes
select schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
from pg_tables
where schemaname = 'public'
order by pg_total_relation_size(schemaname||'.'||tablename) desc;

# Kill all connections to DB (careful!)
select pg_terminate_backend(pid)
from pg_stat_activity
where datname = 'postgres' and pid <> pg_backend_pid();
```

### Vercel

```bash
# List deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Environment variables
vercel env ls production
vercel env add NEWVAR production
```

### Supabase

```bash
# List projects
supabase projects list

# Get connection string
supabase db url --project-ref <project-id>

# Run SQL file
psql $(supabase db url) < migration.sql
```

---

## Contact Information

**On-Call Engineer**: Check PagerDuty rotation
**Escalation**:
- CTO: cto@voiceaitraining.com
- DevOps Lead: devops@voiceaitraining.com

**Slack Channels**:
- #incidents - Active incidents
- #deploys - Deployment notifications
- #on-call - On-call handoff and questions

**External Support**:
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Vapi Support: support@vapi.ai

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial runbooks documentation