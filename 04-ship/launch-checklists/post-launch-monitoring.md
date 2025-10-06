# Post-Launch Monitoring Checklist

Critical monitoring tasks for the first 7 days after launch. Stay vigilant to catch and fix issues quickly.

## Day 1: Launch Day (Covered in launch-day-protocol.md)

Focus: Active monitoring, rapid response, user engagement

---

## Day 2: Stabilization

### Morning Review (9:00 AM)
**Time: 30 minutes**

**Metrics Review:**
- [ ] Total signups (target: +50% from Day 1)
- [ ] Active users (target: 60%+ return rate)
- [ ] Paid conversions (track conversion rate %)
- [ ] Error rate (target: < 0.5%)
- [ ] Average response time (target: < 500ms)
- [ ] Support tickets resolved (target: 100%)

**System Health:**
- [ ] Check error logs for new patterns
- [ ] Review slow query logs
- [ ] Check server resource utilization
- [ ] Verify backup completed successfully
- [ ] Review security logs for suspicious activity
- [ ] Check CDN cache hit rate

**User Feedback:**
- [ ] Review social media mentions
- [ ] Read support ticket themes
- [ ] Check Product Hunt comments
- [ ] Review in-app feedback
- [ ] Note feature requests

### Afternoon Tasks (2:00 PM)
**Time: 1 hour**

**Issue Resolution:**
- [ ] Fix P0 bugs found yesterday
- [ ] Address top user complaints
- [ ] Optimize slow endpoints
- [ ] Update FAQ based on questions
- [ ] Deploy minor fixes

**Content Updates:**
- [ ] Share Day 1 success metrics
- [ ] Post user testimonials
- [ ] Answer community questions
- [ ] Update launch blog post

**Engagement:**
- [ ] Thank early supporters
- [ ] Welcome new users
- [ ] Respond to all support tickets
- [ ] Engage on social media

### Evening Check (8:00 PM)
**Time: 15 minutes**

- [ ] Review day's metrics
- [ ] Check overnight alerts configured
- [ ] Plan tomorrow's priorities
- [ ] Update team on status

---

## Day 3-4: Optimization Phase

### Daily Morning Standup (9:00 AM)
**Time: 15 minutes**

**Quick Wins:**
- [ ] What went well yesterday?
- [ ] What needs fixing today?
- [ ] Any critical issues?
- [ ] What are we shipping today?

### Key Metrics to Monitor

**User Metrics:**
```
Daily Active Users (DAU): ___
Signup Conversion Rate: ___%
Trial-to-Paid Rate: ___%
Activation Rate: ___%
Retention Rate (Day 3): ___%
Average Session Duration: ___min
```

**Performance Metrics:**
```
Average Response Time: ___ms
Error Rate: ___%
Uptime: ___%
Page Load Time: ___s
API Latency p95: ___ms
Database Query Time p95: ___ms
```

**Business Metrics:**
```
Total Signups: ___
Paid Customers: ___
MRR: $_____
Churn Rate: ___%
Support Ticket Volume: ___
Average Resolution Time: ___min
```

### Daily Tasks

**Morning (9:00 AM - 12:00 PM):**
- [ ] Review overnight metrics
- [ ] Check error tracking dashboard
- [ ] Read all support tickets
- [ ] Monitor social mentions
- [ ] Deploy fixes from yesterday
- [ ] Run performance analysis

**Afternoon (1:00 PM - 5:00 PM):**
- [ ] User interviews (1-2 new users)
- [ ] Analyze user behavior data
- [ ] Optimize based on findings
- [ ] Update documentation
- [ ] Prepare improvements
- [ ] Respond to feedback

**Evening (5:00 PM - 6:00 PM):**
- [ ] Review day's progress
- [ ] Document learnings
- [ ] Plan next day
- [ ] Update team

### Red Flags to Watch

**Immediate Action Required:**
- 🚨 Error rate > 2%
- 🚨 Site downtime > 5 minutes
- 🚨 Payment processing failures
- 🚨 Data loss or corruption
- 🚨 Security breach indicators

**High Priority (Fix within 24h):**
- ⚠️ Signup conversion < 2%
- ⚠️ Page load time > 3s
- ⚠️ Support response > 2 hours
- ⚠️ User complaints trending
- ⚠️ Churn rate > 5%

**Medium Priority (Fix within 48h):**
- ⚡ Minor bugs reported
- ⚡ UX improvements needed
- ⚡ Performance optimization opportunities
- ⚡ Content updates required

---

## Day 5-7: Data-Driven Improvements

### Comprehensive Weekly Review

**User Acquisition:**
- [ ] Analyze traffic sources
- [ ] Calculate CAC (Customer Acquisition Cost)
- [ ] Review conversion funnel
- [ ] Identify drop-off points
- [ ] A/B test ideas from data

**User Engagement:**
- [ ] Cohort analysis (Day 1, 3, 7 retention)
- [ ] Feature usage analytics
- [ ] User journey mapping
- [ ] Identify power users
- [ ] Interview churned users

**Technical Performance:**
- [ ] Week-over-week performance trends
- [ ] Identify performance bottlenecks
- [ ] Review infrastructure costs
- [ ] Optimize expensive queries
- [ ] Plan scaling strategy

**Support Analysis:**
- [ ] Categorize all tickets
- [ ] Identify common issues
- [ ] Update FAQ/docs
- [ ] Create help articles
- [ ] Improve UX based on tickets

### Weekly Metrics Dashboard

```
WEEK 1 SUMMARY
==============

User Growth:
- Total Signups: ___
- Active Users: ___
- Paid Customers: ___
- Growth Rate: ___%

Revenue:
- MRR: $_____
- ARPU: $_____
- LTV estimate: $_____

Product:
- Feature Usage Rate: ___%
- Average Session Duration: ___min
- User Satisfaction (NPS): ___
- Critical Bugs: ___

Operations:
- Uptime: ___%
- Avg Response Time: ___ms
- Error Rate: ___%
- Support Resolution Time: ___min

Marketing:
- Traffic Sources: ___
- Conversion Rate: ___%
- Social Reach: ___
- Press Mentions: ___
```

---

## Monitoring Automation

### Set Up Automated Alerts

**Critical Alerts (Immediate notification):**
```javascript
// Example alert configuration

// Error rate spike
if (errorRate > 5%) {
  alert.critical('High error rate detected', {
    currentRate: errorRate,
    threshold: '5%',
    notify: ['engineering', 'on-call']
  })
}

// Site down
if (uptimeStatus === 'down') {
  alert.critical('Site is down', {
    notify: ['everyone']
  })
}

// Payment failures
if (paymentFailureRate > 10%) {
  alert.critical('High payment failure rate', {
    notify: ['engineering', 'finance']
  })
}

// Database issues
if (dbResponseTime > 1000) {
  alert.critical('Database slow', {
    currentTime: dbResponseTime,
    threshold: '1000ms'
  })
}
```

**Warning Alerts (15-minute delay):**
```javascript
// Performance degradation
if (p95ResponseTime > 2000) {
  alert.warning('Performance degraded')
}

// High support volume
if (openTickets > 50) {
  alert.warning('High support ticket volume')
}

// Low conversion
if (signupConversionRate < 2%) {
  alert.warning('Low conversion rate')
}
```

**Info Alerts (Daily digest):**
```javascript
// Daily metrics summary
alert.info('Daily Metrics Report', {
  signups: dailySignups,
  revenue: dailyRevenue,
  tickets: dailyTickets,
  errors: dailyErrors
})
```

### Automated Health Checks

**Every 5 Minutes:**
- [ ] Ping homepage (expect 200)
- [ ] Check API health endpoint
- [ ] Verify database connection
- [ ] Check critical user flow

**Every Hour:**
- [ ] Run smoke test suite
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Check backup status

**Daily:**
- [ ] Full E2E test suite
- [ ] Security scan
- [ ] Performance audit
- [ ] Dependency check

---

## User Communication

### Daily Updates (First Week)

**What to Share:**
- New features shipped
- Bugs fixed
- Performance improvements
- User success stories
- Metrics milestones

**Where to Post:**
- Twitter/X (daily)
- Product Hunt (Days 1-3)
- LinkedIn (2-3x/week)
- Email newsletter (Day 7)
- Blog (Day 7)

### Response Time Targets

**Support Tickets:**
- Critical: < 1 hour
- High priority: < 4 hours
- Medium priority: < 24 hours
- Low priority: < 48 hours

**Social Media:**
- Mentions: < 2 hours
- Comments: < 4 hours
- DMs: < 8 hours

**Community:**
- Forum posts: < 12 hours
- Discord: < 4 hours
- Feature requests: < 24 hours (acknowledgment)

---

## Weekly Team Rituals

### Monday: Planning
- [ ] Review last week's metrics
- [ ] Set this week's goals
- [ ] Prioritize improvements
- [ ] Assign responsibilities

### Wednesday: Mid-week Check
- [ ] Progress on weekly goals
- [ ] Blockers or issues
- [ ] Adjust priorities if needed

### Friday: Retrospective
- [ ] What went well
- [ ] What needs improvement
- [ ] Learnings and insights
- [ ] Celebrate wins

---

## Success Indicators (First Week)

### Minimum Success
- 100+ signups
- 10+ paying customers
- $500+ MRR
- 99% uptime
- < 1% error rate
- NPS > 30

### Good Success
- 500+ signups
- 50+ paying customers
- $2,500+ MRR
- 99.9% uptime
- < 0.5% error rate
- NPS > 50

### Exceptional Success
- 1,000+ signups
- 100+ paying customers
- $5,000+ MRR
- 99.99% uptime
- < 0.1% error rate
- NPS > 70

---

## Common Issues & Solutions

### Low Signup Conversion

**Diagnose:**
- Check traffic quality
- Review signup flow analytics
- Test signup process yourself
- Read support tickets

**Fix:**
- Simplify signup form
- Add social proof
- Improve value proposition
- A/B test different CTAs
- Add demo/trial option

### High Churn Rate

**Diagnose:**
- Interview churned users
- Analyze usage patterns
- Check onboarding completion
- Review cancellation reasons

**Fix:**
- Improve onboarding
- Add success checkpoints
- Proactive customer success
- Address top complaints
- Better feature education

### Slow Performance

**Diagnose:**
- Run Lighthouse audit
- Check slow query logs
- Profile frontend bundle
- Monitor server resources

**Fix:**
- Optimize database queries
- Add caching layer
- Reduce bundle size
- Upgrade server resources
- Implement CDN

### Support Overwhelm

**Diagnose:**
- Categorize all tickets
- Identify common issues
- Check response times
- Review customer feedback

**Fix:**
- Create FAQ/help docs
- Add in-app guides
- Fix common bugs
- Automate responses
- Hire support help

---

## Tools to Monitor

### Essential Dashboards

**Error Tracking:**
- Sentry
- Bugsnag
- Rollbar

**Performance:**
- Vercel Analytics
- Google Analytics
- Datadog
- New Relic

**Uptime:**
- Pingdom
- UptimeRobot
- Better Uptime

**User Behavior:**
- PostHog
- Mixpanel
- Amplitude

**Customer Support:**
- Intercom
- Zendesk
- Plain

---

## End of Week 1

### Comprehensive Review

**Schedule:** Friday, 4:00 PM

**Attendees:** Full team

**Agenda:**
1. Metrics review (30 min)
2. Wins and challenges (30 min)
3. User feedback themes (20 min)
4. Week 2 priorities (20 min)
5. Celebration! (20 min) 🎉

**Deliverables:**
- [ ] Week 1 metrics report
- [ ] User feedback summary
- [ ] Technical improvements list
- [ ] Week 2 roadmap
- [ ] Blog post: "Week 1 Learnings"

---

**Remember**: The first week sets the tone. Stay responsive, fix issues quickly, and keep improving based on real user feedback.

**HermeticSaaS Principle**: Ship, measure, learn, improve. Every day is a chance to make your product better.
