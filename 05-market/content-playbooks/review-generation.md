# Ethical Review Generation Guide for MicroSaaS Apps

## Table of Contents
1. [The Hermetic Approach to Reviews](#the-hermetic-approach-to-reviews)
2. [Timing for Review Requests](#timing-for-review-requests)
3. [In-App Review Prompts](#in-app-review-prompts)
4. [Email Sequences for Reviews](#email-sequences-for-reviews)
5. [Responding to Negative Reviews](#responding-to-negative-reviews)
6. [Converting Detractors to Promoters](#converting-detractors-to-promoters)
7. [Review Velocity Strategies](#review-velocity-strategies)
8. [What NOT to Do](#what-not-to-do)

---

## The Hermetic Approach to Reviews

### Ethical Review Building Principles

```
THE HERMETIC WAY:
✓ Earn reviews through value delivery
✓ Make review prompts optional and non-intrusive
✓ Never manipulate or incentivize
✓ Respond to all reviews (positive and negative)
✓ Use negative feedback to improve
✓ Build sustainable review velocity
✓ Focus on honest user experiences

FORBIDDEN (Against Policy & Ethics):
✗ Never buy fake reviews
✗ Never incentivize reviews ("review for premium")
✗ Never review-gate features
✗ Never ask only happy users
✗ Never ignore negative reviews
✗ Never spam users with requests
✗ Never pressure or guilt users
```

### Why Reviews Matter

```
IMPACT OF REVIEWS:

Conversion Rate:
- 4.0 stars: Baseline
- 4.5 stars: +35% conversion
- 4.8+ stars: +50% conversion

Ranking Algorithm:
- Review velocity (reviews/day): 15-20% weight
- Average rating: 20-25% weight
- Review recency: 10-15% weight
- Total review count: 10-15% weight

Social Proof:
- First impression in search results
- Trust signal for new users
- Validation for premium pricing
- Defense against competitors

Feature Discovery:
- Reviews reveal what users love
- Feature requests in 1-star reviews
- Use cases you didn't expect
- Pain points to address
```

### Target Review Metrics

```
REALISTIC BENCHMARKS:

New App (0-3 months):
- Reviews per 100 downloads: 1-2%
- Target rating: 4.0+
- Response rate: 100%
- Response time: <48 hours

Growing App (3-12 months):
- Reviews per 100 downloads: 2-4%
- Target rating: 4.3+
- Response rate: 100%
- Response time: <24 hours

Mature App (12+ months):
- Reviews per 100 downloads: 3-5%
- Target rating: 4.5+
- Response rate: 100%
- Response time: <12 hours

Red Flags:
- <4.0 rating: Fundamental product issues
- Declining rating trend: Quality degradation
- <1% review rate: Not asking / poor value
- >5% 1-star reviews: Critical problems
```

---

## Timing for Review Requests

### The Golden Moments

**Best Times to Request Reviews:**

```
1. AFTER GOAL COMPLETION
   Example: User saves their first $500

   Why it works:
   - User just experienced success
   - Positive emotional state
   - Clear value received
   - Natural moment of satisfaction

2. AFTER SOLVING A PAIN POINT
   Example: User recovers deleted note

   Why it works:
   - Relief and gratitude
   - Direct problem resolution
   - App proved its value
   - User feels heard

3. AFTER POSITIVE SUPPORT INTERACTION
   Example: Support resolved their issue in <2 hours

   Why it works:
   - Exceeded expectations
   - Personal connection
   - Problem solved
   - Grateful for help

4. AFTER CONSISTENT USAGE
   Example: User opens app 10th time

   Why it works:
   - Proven habit formation
   - Clear ongoing value
   - User is engaged
   - Familiar with features

5. AFTER EXPLORING PREMIUM FEATURES
   Example: User tries premium trial

   Why it works:
   - Experiencing enhanced value
   - Positive discovery
   - Upgrade consideration
   - Good experience

6. AFTER MILESTONE ACHIEVEMENT
   Example: User completes 30-day streak

   Why it works:
   - Achievement pride
   - Long-term value proven
   - Success celebration
   - Community connection
```

### The Worst Times to Request

**Never Request Reviews:**

```
1. ON FIRST APP OPEN
   Why: User hasn't experienced value yet
   Impact: Annoyance, immediate negative impression

2. AFTER AN ERROR OR CRASH
   Why: User is frustrated
   Impact: Guaranteed 1-star review

3. DURING USER FRUSTRATION
   Example: User just lost unsaved data
   Why: Negative emotional state
   Impact: Angry review

4. WHEN FEATURE ISN'T WORKING
   Why: Poor user experience
   Impact: Valid negative feedback

5. BEFORE USER SEES VALUE
   Example: On signup completion
   Why: No experience to review
   Impact: "Too early to review" or skip

6. MORE THAN 3 TIMES PER YEAR
   Why: Feels like harassment
   Impact: User annoyance, uninstall

7. DURING ONBOARDING
   Why: User is still learning
   Impact: Confusion, interruption

8. AFTER CHARGING USER
   Example: Immediately after subscription purchase
   Why: Feels transactional
   Impact: Suspicious of motivation
```

### Timing Implementation Framework

**Trigger Conditions:**

```swift
// iOS Example - Intelligent Review Timing

import StoreKit

class ReviewManager {

    static func checkAndRequestReview() {
        guard shouldRequestReview() else { return }

        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
            recordReviewRequest()
        }
    }

    private static func shouldRequestReview() -> Bool {
        let defaults = UserDefaults.standard

        // Conditions that must be met
        let appOpenCount = defaults.integer(forKey: "appOpenCount")
        let goalsCompleted = defaults.integer(forKey: "goalsCompleted")
        let lastReviewRequest = defaults.object(forKey: "lastReviewRequestDate") as? Date
        let reviewRequestCount = defaults.integer(forKey: "reviewRequestCount")
        let daysSinceInstall = getDaysSinceInstall()

        // Never request more than 3 times per year
        guard reviewRequestCount < 3 else { return false }

        // At least 60 days since last request
        if let lastRequest = lastReviewRequest {
            let daysSinceRequest = Calendar.current.dateComponents([.day],
                from: lastRequest, to: Date()).day ?? 0
            guard daysSinceRequest >= 60 else { return false }
        }

        // User has been using app for at least 7 days
        guard daysSinceInstall >= 7 else { return false }

        // User has opened app at least 10 times
        guard appOpenCount >= 10 else { return false }

        // User has completed at least 3 goals
        guard goalsCompleted >= 3 else { return false }

        // No recent crashes or errors
        guard !hasRecentErrors() else { return false }

        return true
    }

    private static func recordReviewRequest() {
        let defaults = UserDefaults.standard
        defaults.set(Date(), forKey: "lastReviewRequestDate")
        defaults.set(defaults.integer(forKey: "reviewRequestCount") + 1,
                     forKey: "reviewRequestCount")
    }

    private static func hasRecentErrors() -> Bool {
        // Check if there were crashes/errors in last 24 hours
        // Implementation depends on your error tracking
        return false
    }

    private static func getDaysSinceInstall() -> Int {
        let defaults = UserDefaults.standard
        guard let installDate = defaults.object(forKey: "installDate") as? Date else {
            // First launch - set install date
            defaults.set(Date(), forKey: "installDate")
            return 0
        }
        return Calendar.current.dateComponents([.day], from: installDate, to: Date()).day ?? 0
    }
}

// Trigger at appropriate moments:

// After goal completion
func onGoalCompleted() {
    let defaults = UserDefaults.standard
    defaults.set(defaults.integer(forKey: "goalsCompleted") + 1, forKey: "goalsCompleted")

    // Request review if conditions met
    ReviewManager.checkAndRequestReview()
}

// After app open
func onAppOpen() {
    let defaults = UserDefaults.standard
    defaults.set(defaults.integer(forKey: "appOpenCount") + 1, forKey: "appOpenCount")

    // Don't request on every open, only at specific moments
    // This increments the counter for future eligibility
}
```

### Frequency Guidelines

```
MAXIMUM FREQUENCY:

Per User:
- 3 requests per 365 days (Apple guideline)
- 60+ days between requests
- Only when conditions met

Per App Version:
- Recommend: 1 request per major version
- Maximum: 2 requests per version

After User Action:
- Never immediately repeat
- If user dismisses, wait 60+ days
- If user reviews, never ask again

Best Practice Schedule:
- Request 1: After 7-14 days of usage + value moment
- Request 2: After 3-6 months + major milestone
- Request 3: After 9-12 months + premium upgrade/renewal
```

---

## In-App Review Prompts

### Native vs Custom Prompts

**Always Use Native Prompts:**

```
iOS: SKStoreReviewController
Android: ReviewManager API

WHY NATIVE IS BETTER:
✓ Apple/Google recommends it
✓ Less intrusive (system UI)
✓ Can be dismissed easily
✓ Doesn't disrupt flow
✓ Tracks request frequency automatically
✓ Better conversion (users trust platform UI)

WHY CUSTOM IS PROBLEMATIC:
✗ Feels spammy
✗ Against guidelines if too pushy
✗ Requires extra code
✗ Disrupts user experience
✗ Lower conversion
```

### Soft Prompt Strategy (Pre-Native)

**Optional: Gauge Satisfaction First**

```
Some developers use a "soft prompt" before the native prompt:

┌──────────────────────────────┐
│  Enjoying [App Name]?        │
│                              │
│  [Yes!] [Not Really]        │
└──────────────────────────────┘

IF "Yes!" → Trigger native review prompt
IF "Not Really" → Show feedback form

PROS:
+ Filters out potential negative reviews
+ Captures feedback from unhappy users
+ Can improve conversion rate

CONS:
- Extra friction (one more tap)
- Against spirit of honest reviews
- Can be seen as manipulative

HERMETIC RECOMMENDATION:
Skip the soft prompt. Let all users review honestly.
Use feedback forms separately, not as review gatekeeping.
```

### Context-Specific Prompts

**Contextual Messaging (Before Native Prompt):**

```
AFTER GOAL COMPLETION:

┌──────────────────────────────┐
│  Congratulations!            │
│  You've reached your savings │
│  goal of $1,000!             │
│                              │
│  Mind sharing your success   │
│  story with others?          │
│                              │
│  [Share Review] [Later]     │
└──────────────────────────────┘

→ Tap "Share Review" → Native prompt


AFTER PROBLEM SOLVED:

┌──────────────────────────────┐
│  Great news!                 │
│  Your issue has been         │
│  resolved.                   │
│                              │
│  How was your support        │
│  experience?                 │
│                              │
│  [Rate Us] [Send Feedback]  │
└──────────────────────────────┘

→ Tap "Rate Us" → Native prompt
→ Tap "Send Feedback" → Feedback form


AFTER MILESTONE:

┌──────────────────────────────┐
│  30-Day Streak! 🎉          │
│  You've used [App] daily     │
│  for a whole month.          │
│                              │
│  Help others discover        │
│  [App]?                      │
│                              │
│  [Leave Review] [Maybe Later]│
└──────────────────────────────┘

→ Tap "Leave Review" → Native prompt
```

### Implementation Examples

**iOS Implementation:**

```swift
// Simple direct approach (recommended)
import StoreKit

func requestReview() {
    if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
        SKStoreReviewController.requestReview(in: scene)
    }
}

// With contextual message
func showReviewPrompt(context: String) {
    let alert = UIAlertController(
        title: "Enjoying \(appName)?",
        message: context,
        preferredStyle: .alert
    )

    alert.addAction(UIAlertAction(title: "Rate \(appName)", style: .default) { _ in
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
    })

    alert.addAction(UIAlertAction(title: "Maybe Later", style: .cancel))

    // Present alert
    // (Get current view controller and present)
}
```

**Android Implementation:**

```kotlin
// Simple direct approach (recommended)
import com.google.android.play.core.review.ReviewManagerFactory

fun requestReview(activity: Activity) {
    val manager = ReviewManagerFactory.create(activity)
    val request = manager.requestReviewFlow()

    request.addOnCompleteListener { task ->
        if (task.isSuccessful) {
            val reviewInfo = task.result
            manager.launchReviewFlow(activity, reviewInfo)
        }
    }
}

// With contextual message
fun showReviewPrompt(context: Context, message: String) {
    AlertDialog.Builder(context)
        .setTitle("Enjoying ${getString(R.string.app_name)}?")
        .setMessage(message)
        .setPositiveButton("Rate ${getString(R.string.app_name)}") { _, _ ->
            requestReview(context as Activity)
        }
        .setNegativeButton("Maybe Later", null)
        .show()
}
```

---

## Email Sequences for Reviews

### Email vs In-App Strategy

```
USE IN-APP WHEN:
✓ User is actively engaged
✓ Just completed valuable action
✓ In positive emotional state
✓ Timing is perfect

USE EMAIL WHEN:
✓ Power users (frequent openers)
✓ Long-term customers (3+ months)
✓ Premium/paid users
✓ After support resolution
✓ Milestone achievements
```

### Review Request Email Template 1: Power User

```
SUBJECT: Quick favor? It takes 30 seconds

Hi [FirstName],

I noticed you've been using [App Name] almost daily this month. That's amazing!

Since you're clearly getting value from the app, I have a small favor to ask:

Would you mind leaving a quick review on the App Store?

[Leave a 5-Star Review →]

Reviews from power users like you help other people discover [App Name] and decide if it's right for them.

If something isn't working perfectly, just reply to this email instead. I read every message personally and will fix it.

Thanks for being part of our community!

[Your Name]
Founder, [App Name]
[your@email.com]

P.S. Seriously, hit reply if you have any feature requests. Your input shapes our roadmap.

---

TIMING: After 30+ sessions in a month
PERSONALIZATION: Include actual usage stat
CONVERSION RATE: 8-12% typical
```

### Review Request Email Template 2: Post-Milestone

```
SUBJECT: You just hit a major milestone 🎉

Hi [FirstName],

Congratulations! You just [specific achievement]:
- Tracked $[X] in expenses
- Completed [Y] goals
- Used [App Name] for [Z] days straight

[Personal insight about their achievement]

If [App Name] is helping you [benefit], would you share your experience?

[Share Your Success Story →]

Your review helps others who are struggling with [problem] discover how [App Name] can help them too.

Either way, thanks for being an awesome user!

[Your Name]
[App Name] Team

P.S. What feature would make [App Name] even better for you? Hit reply and let me know.

---

TIMING: After significant milestone
PERSONALIZATION: Actual user data
CONVERSION RATE: 10-15% typical
```

### Review Request Email Template 3: Post-Support

```
SUBJECT: Did we resolve your issue?

Hi [FirstName],

Following up on your support request about [specific issue].

I hope [Solution] worked for you. If you're still having trouble, just reply and I'll personally dig deeper.

If we got you back on track, I'd be grateful if you'd share your experience:

[Rate Our Support →]

We're a small team working hard to help [number] people [achieve goal]. Your feedback helps us improve and helps others discover us.

Thanks for giving us a chance to help!

[Your Name]
[App Name] Support

---

TIMING: 24-48 hours after resolution
PERSONALIZATION: Reference their specific issue
CONVERSION RATE: 15-20% typical (highest)
```

### Review Request Email Template 4: Premium Upgrade

```
SUBJECT: Loving [Premium Feature]?

Hi [FirstName],

You upgraded to [App Name] Premium [X] days ago. I hope you're enjoying [specific premium features]!

Since you found enough value to upgrade, would you mind sharing what made you decide?

[Leave a Review →]

Your story helps other users understand the value of Premium and helps us reach more people who need [core benefit].

If Premium isn't meeting your expectations, reply and tell me what's missing. I genuinely want to make it better.

Thanks for supporting [App Name]!

[Your Name]
Founder, [App Name]

---

TIMING: 7-14 days after upgrade
PERSONALIZATION: Mention specific premium features
CONVERSION RATE: 12-18% typical
```

### Email Sequence Cadence

```
RECOMMENDED SEQUENCE:

Day 14: Onboarding check-in (no ask)
Day 30: Usage milestone (first review request)
Day 90: Feature exploration (second review request)
Day 180: Premium upgrade/renewal (third review request)

RULES:
- Maximum 3 review requests per year via email
- Only email engaged users (10+ sessions)
- Stop if they review (thank them separately)
- Allow unsubscribe from review emails
- Separate from general marketing emails
```

### Email Best Practices

```
DO:
✓ Use founder's name (personal touch)
✓ Reference specific user data
✓ Keep it under 150 words
✓ Single clear call-to-action
✓ Offer alternative (feedback vs review)
✓ Make unsubscribe easy
✓ Respond to all replies

DON'T:
✗ Use generic template language
✗ Send from no-reply@
✗ Ask multiple times in short period
✗ Incentivize reviews
✗ Only ask happy users
✗ Use pushy language
✗ Make it feel transactional
```

---

## Responding to Negative Reviews

### The 24-Hour Response Framework

**Why Speed Matters:**

```
Response within 24 hours:
- Shows you care
- Prevents review spread (other users see you respond)
- Can turn 1-star into 4-star
- Demonstrates active development
- Builds trust with potential users

Response after 1 week:
- Looks like you don't monitor
- User has moved on
- Damage is done
- Other users already saw it
```

### Response Template Structure

```
STRUCTURE:

1. ACKNOWLEDGE (1 sentence)
   Thank them / Apologize / Recognize frustration

2. ADDRESS (1-2 sentences)
   Speak to their specific issue
   Take responsibility if appropriate

3. ACTION (1 sentence)
   What you're doing to fix it
   Specific timeline if possible

4. INVITE (1 sentence)
   Direct contact for resolution
   Personal email/support

5. SIGNATURE
   Real name + Title
   Shows personal involvement

TOTAL: 4-5 sentences maximum
```

### 1-Star Review Response Templates

**Template: Bug/Crash Issue**

```
[Name], I'm really sorry the app crashed and lost your data. That's incredibly frustrating and not the experience we want anyone to have.

We've identified the issue and are releasing a fix in the next 48 hours. I'd like to personally help recover your data if possible.

Please email me directly at [your@email.com] with your account details and I'll prioritize this immediately.

- [Your Name], Founder at [App Name]

---

WHY IT WORKS:
- Empathy first
- Specific timeline
- Personal involvement
- Direct path to resolution
```

**Template: Missing Feature**

```
Thanks for trying [App Name], [Name]. I hear you on needing [feature they want] - it's actually on our roadmap for Q[X].

In the meantime, you can achieve [similar result] by [workaround]. I know it's not ideal, but it might help.

If you'd like to discuss your specific use case, email me at [your@email.com]. User feedback like yours shapes what we build next.

- [Your Name], [App Name] Team

---

WHY IT WORKS:
- Validates their need
- Shows it's planned
- Offers interim solution
- Invites continued dialogue
```

**Template: Confusing UX**

```
[Name], thanks for the feedback. You're right that [specific thing] isn't as clear as it should be.

We're redesigning that section based on feedback like yours. In the meantime, [brief explanation of how to do what they wanted].

If you're open to it, I'd love to show you the new design before we launch. Email me at [your@email.com] if interested!

- [Your Name], [App Name] Team

---

WHY IT WORKS:
- Agrees with them
- Shows action being taken
- Educates in the interim
- Invites collaboration
```

**Template: Pricing Complaint**

```
I understand [App Name] Premium feels expensive, [Name]. Building [brief explanation of value/costs] isn't cheap, but I hear your concern.

We offer [free tier details] and [alternative option]. If neither works for your situation, I'm happy to discuss.

Email me at [your@email.com] and let's see if we can find a solution that works for you.

- [Your Name], Founder at [App Name]

---

WHY IT WORKS:
- Empathy for concern
- Brief value justification
- Alternative options
- Personal negotiation offer
```

### 2-3 Star Review Response Templates

**Template: Mixed Experience**

```
Thanks for the balanced feedback, [Name]! Glad you're finding [feature they liked] helpful.

Regarding [their criticism], you're absolutely right. We're working on improving [specific thing] in our next update (early [Month]).

If there's anything else that would make [App Name] more valuable for you, I'm all ears: [your@email.com]

- [Your Name], [App Name] Team

---

WHY IT WORKS:
- Acknowledges positives
- Addresses criticism specifically
- Timeline for improvement
- Open to more feedback
```

### What NOT to Say in Responses

```
❌ NEVER SAY:

"This is user error..." (Defensive)
→ Instead: "Let me help you with that..."

"That feature is coming soon" (Vague)
→ Instead: "We're launching that in Q2"

"We don't plan to add that" (Dismissive)
→ Instead: "That's not currently on our roadmap, but I'm interested in your use case..."

"Other users don't have this problem" (Invalidating)
→ Instead: "I haven't heard this before - let me investigate..."

"You should have read the tutorial" (Condescending)
→ Instead: "I can see how that's confusing. Here's a quick guide..."

"Please change your review" (Desperate)
→ Instead: "If we resolve this, we'd love to hear if it changed your experience"

"Contact support" (Passing the buck)
→ Instead: "Email me personally at..."
```

---

## Converting Detractors to Promoters

### The Recovery Process

**5-Step Detractor Recovery:**

```
STEP 1: FAST ACKNOWLEDGMENT (within 12 hours)
- Public response on review
- Personal apology
- Show you're taking it seriously

STEP 2: PRIVATE OUTREACH (within 24 hours)
- Email them directly
- Personalized message
- Explain what happened
- Ask for specifics

STEP 3: IMMEDIATE FIX (within 48-72 hours)
- Resolve their specific issue
- Fix bug if applicable
- Provide workaround
- Go above and beyond

STEP 4: FOLLOW-UP CONFIRMATION (1 week later)
- Verify issue is resolved
- Ask if they're satisfied
- Thank them for patience
- NO pressure to change review

STEP 5: THE GENTLE ASK (2-4 weeks later)
- Only if they express satisfaction
- "Would you consider updating your review?"
- Make it optional
- Accept "no" gracefully
```

### Recovery Email Templates

**Email 1: Initial Outreach**

```
SUBJECT: I saw your [App Name] review - can I help?

Hi [Name],

I saw your review about [specific issue]. I'm [Your Name], founder of [App Name], and I'm personally reaching out because this isn't the experience we want anyone to have.

I'd like to fix this for you right away. Can you reply with:

1. Your account email (if you have one)
2. What you were trying to do when [issue] happened
3. Your device model and iOS/Android version

I'll have this resolved within 24 hours and follow up to make sure everything's working perfectly.

We're a small team genuinely trying to help people [core mission], and your feedback is invaluable for improving [App Name].

Thank you for giving us a chance to make this right.

[Your Name]
Founder, [App Name]
[Direct Email]
[Phone Number] (optional but powerful)

---

TIMING: Within 24 hours of review
PERSONALIZATION: Reference their specific issue
TONE: Humble, helpful, accountable
```

**Email 2: Issue Resolved Follow-Up**

```
SUBJECT: [App Name] issue resolved - is everything working now?

Hi [Name],

Following up on [specific issue] - we've:
- [Specific fix 1]
- [Specific fix 2]
- [Any additional improvements]

Can you check if everything's working smoothly now? If you're still having any problems, reply immediately and I'll jump on it.

Thanks for your patience while we fixed this. Users like you make [App Name] better for everyone.

[Your Name]
[App Name] Team

P.S. If this resolved your issue and you're happy with how we handled it, we'd appreciate if you'd consider updating your review. No pressure though - just grateful you gave us a chance to improve.

---

TIMING: After fix is deployed (48-72 hours from initial contact)
TONE: Hopeful but not presumptive
ASK: Gentle, with "no pressure" escape
```

**Email 3: Long-Term Check-In (Only if they were satisfied)**

```
SUBJECT: How's [App Name] been working for you?

Hi [Name],

It's been a few weeks since we resolved [issue]. I wanted to check in and make sure everything's still working well.

If you've been having a better experience with [App Name], would you consider updating your App Store review? It would really help other users understand that we take issues seriously and fix them quickly.

[Update Review Link →]

If you're still having problems or have any suggestions, I'm always here: [your@email.com]

Thanks for being patient with us!

[Your Name]
[App Name]

---

TIMING: 2-4 weeks after resolution
CONDITION: Only if they expressed satisfaction
TONE: Appreciative, not demanding
```

### Recovery Success Metrics

```
TRACK THESE:

Detractor Outreach Rate:
Target: 100% of 1-2 star reviews contacted within 24 hours

Response Rate:
Baseline: 30-40% of contacted users reply
Good: 50-60% reply
Great: 70%+ reply

Resolution Rate:
Target: 80%+ of issues resolved to user satisfaction

Review Update Rate:
Realistic: 20-30% update their review after resolution
Good: 30-40% update
Great: 40%+ update

Average Rating Change:
1-star → 4-star: Excellent recovery
2-star → 4-star: Good recovery
+1-2 stars: Successful recovery
```

---

## Review Velocity Strategies

### Building Sustainable Review Flow

**Velocity = Reviews per Day**

```
TARGET VELOCITY BY APP SIZE:

< 100 DAU: 0.5-1 review/day
100-500 DAU: 1-3 reviews/day
500-2k DAU: 3-10 reviews/day
2k-10k DAU: 10-30 reviews/day
10k+ DAU: 30+ reviews/day

HEALTHY RATIO:
2-3% of monthly active users leave reviews
(e.g., 1,000 MAU = 20-30 reviews/month)
```

### Systematic Review Generation System

**The Weekly Review Sprint:**

```
MONDAY:
- Review last week's review metrics
- Identify users who hit milestones
- Queue review request emails

TUESDAY:
- Send review request emails (batch 1)
- Respond to all weekend reviews

WEDNESDAY:
- Trigger in-app prompts for milestone users
- Send review request emails (batch 2)

THURSDAY:
- Respond to all new reviews
- Follow up with detractors

FRIDAY:
- Send recovery emails to resolved issues
- Weekly review metrics report

ONGOING:
- Monitor in-app prompt triggers
- Auto-respond to App Store Connect alerts
- Track review sentiment
```

### Optimization Experiments

**A/B Tests to Run:**

```
TEST 1: REQUEST TIMING
Control: 10 app opens
Variant: After first goal completion
Metric: Request acceptance rate
Duration: 30 days

TEST 2: EMAIL SUBJECT LINE
Control: "Quick favor? It takes 30 seconds"
Variant: "You just hit a major milestone 🎉"
Metric: Open rate + click rate
Duration: 14 days

TEST 3: SOFT PROMPT vs DIRECT
Control: Soft prompt (satisfaction gauge)
Variant: Direct native prompt
Metric: Review completion rate
Duration: 30 days

TEST 4: EMAIL FROM NAME
Control: "[App Name] Team"
Variant: "[Founder Name], Founder"
Metric: Open rate + response rate
Duration: 14 days
```

---

## What NOT to Do

### The Forbidden List

**Practices That Will Get You Banned:**

```
1. ❌ BUYING FAKE REVIEWS
   Platform: Instant ban risk
   Detection: Algorithm flags unnatural patterns
   Penalty: App removal

2. ❌ INCENTIVIZING REVIEWS
   "Leave a review, get Premium free!"
   Platform: Against TOS
   Detection: Keyword monitoring
   Penalty: Review deletion, possible ban

3. ❌ REVIEW GATING
   "Unlock feature after 5-star review"
   Platform: Explicitly prohibited
   Detection: User reports
   Penalty: App rejection/removal

4. ❌ ASKING ONLY HAPPY USERS
   "If you love it, review us!"
   Issue: Manipulative, dishonest
   Detection: Suspiciously high rating
   Consequence: Loss of trust

5. ❌ FAMILY & FRIENDS REVIEWS
   Well-intentioned but harmful
   Detection: IP patterns, similar phrasing
   Consequence: Review deletion

6. ❌ REVIEW SWAPPING
   "I'll review yours if you review mine"
   Platform: Against TOS
   Detection: Cross-referencing patterns
   Penalty: Account suspension

7. ❌ EDITING NEGATIVE REVIEWS
   Trying to suppress or hide them
   Platform: Impossible (can only respond)
   Consequence: Looks desperate

8. ❌ CREATING FAKE ACCOUNTS
   "Let me review my own app!"
   Detection: Easy to spot
   Consequence: Criminal fraud risk
```

### Dark Patterns to Avoid

```
MANIPULATIVE TACTICS (DON'T USE):

❌ Repeated Prompts
Asking every session until they review

❌ Guilt Trips
"We're a small team that needs your help..."

❌ Hiding "No Thanks" Button
Making it hard to decline

❌ Fake Urgency
"Review in next 24 hours for bonus!"

❌ Pre-Selected 5 Stars
Defaulting to highest rating

❌ Review Walls
Blocking content until they review

❌ Conditional Features
"Premium unlocks after review"

❌ Misleading Prompts
"Rate your experience" → directs to social media, not store
```

### Honest Mistakes to Avoid

```
WELL-MEANING BUT WRONG:

❌ Asking Too Early
Requesting review on first open
Fix: Wait for value moment

❌ Asking Too Often
Every week/month
Fix: 60+ days between requests, max 3/year

❌ Ignoring Negative Reviews
"I don't want to engage with haters"
Fix: Respond to ALL reviews within 24-48 hours

❌ Generic Responses
Copy-paste same reply
Fix: Personalize every response

❌ Over-Apologizing
"Sorry sorry sorry we're terrible"
Fix: Apologize once, focus on solution

❌ Arguing with Reviews
"Actually, you're wrong because..."
Fix: Thank them, explain kindly, offer help

❌ Promising Vague Future
"We'll add that soon!"
Fix: Specific timeline or "not currently planned"
```

---

## Review Response Templates Library

### Positive Reviews (4-5 Stars)

**5-Star Enthusiastic:**
```
Thank you so much for the amazing review, [Name]! We're thrilled that [App Name] is helping you [specific benefit they mentioned].

If you ever need anything, we're here: [email]

- [Your Name], [App Name] Team
```

**5-Star with Specific Praise:**
```
[Name], thanks for the kind words! We're especially happy you love [feature they mentioned] - our team worked hard on that one.

If you have any feature requests, we're all ears: [email]

- [Your Name], [App Name]
```

**4-Star Positive with Suggestion:**
```
Thanks for the review, [Name]! Glad you're finding [App Name] useful.

Great suggestion on [their idea]. We're actually working on something similar for our [timeframe] update. I'll email you when it's ready if you're interested!

- [Your Name], [App Name] Team
```

### Critical Reviews (1-3 Stars)

**1-Star Bug Report:**
```
[Name], I'm really sorry you experienced [bug]. This shouldn't happen and we're investigating immediately.

Please email me at [email] with your device info and I'll get this fixed for you personally within 24 hours.

- [Your Name], Founder
```

**2-Star Missing Feature:**
```
Thanks for trying [App Name], [Name]. [Feature they want] is actually on our roadmap for Q[X].

Until then, you might be able to [workaround]. Not ideal, but might help!

Feedback like yours shapes what we build next: [email]

- [Your Name], [App Name]
```

**3-Star Learning Curve:**
```
[Name], you're right that [specific thing] isn't as intuitive as it should be. We're simplifying that in our next update.

In the meantime, [brief how-to]. Also, we have a quick tutorial at [link] that might help!

- [Your Name], [App Name] Team
```

---

## Review Metrics Dashboard

### Weekly Review Scorecard

```
WEEK OF: [Date Range]

VOLUME METRICS:
- Total reviews: ___
- 5-star: ___ (___%)
- 4-star: ___ (___%)
- 3-star: ___ (___%)
- 2-star: ___ (___%)
- 1-star: ___ (___%)
- Average rating: ___

VELOCITY:
- Reviews per day: ___
- vs last week: ↑↓ ___
- Reviews per 100 users: ___% (target: 2-5%)

RESPONSE METRICS:
- Response rate: ___% (target: 100%)
- Average response time: ___ hours (target: <24)
- Detractor outreach: ___% (target: 100% of 1-2 star)

RECOVERY:
- Detractors contacted: ___
- Replied to outreach: ___ (___%)
- Issues resolved: ___ (___%)
- Reviews updated: ___ (___%)

SENTIMENT:
- Primary positive themes: _______________
- Primary negative themes: _______________
- Feature requests: _______________
- Bugs reported: _______________

ACTION ITEMS:
1. _______________
2. _______________
3. _______________

Next review: [Date]
```

---

## Complete Review Generation Checklist

### Setup Phase (One-Time)

- [ ] Implement native review prompt (iOS/Android)
- [ ] Set up review request triggers (timing logic)
- [ ] Create review request email templates
- [ ] Set up App Store Connect / Play Console alerts
- [ ] Create review response template library
- [ ] Assign review response responsibility
- [ ] Set up review tracking spreadsheet
- [ ] Define review metrics targets

### Weekly Operations

- [ ] Respond to all reviews within 24 hours
- [ ] Personalize each response
- [ ] Contact all 1-2 star reviewers directly
- [ ] Send review request emails to eligible users
- [ ] Follow up with detractor recovery emails
- [ ] Update review metrics dashboard
- [ ] Identify trends in feedback

### Monthly Analysis

- [ ] Review overall rating trend
- [ ] Analyze review sentiment themes
- [ ] Identify feature requests from reviews
- [ ] Calculate review velocity
- [ ] Assess detractor recovery rate
- [ ] Optimize review request timing
- [ ] A/B test review request copy
- [ ] Report review insights to team

---

**Last Updated:** 2025-10-05
**Part of:** HermeticSaaS Content Playbooks
**Ethical Standard:** Honest, user-first review building
