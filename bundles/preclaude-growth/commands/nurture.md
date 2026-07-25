---
description: Speed-to-lead and show-rate machine — response templates, schedule/show/no-show sequences built on the four nurture pillars
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[business type or lead source, e.g. 'demo bookings from Meta ads']"
model: sonnet
---

# Nurture Command: $ARGUMENTS

Leads rot fast. This command builds the follow-up system that gets more leads to **respond, schedule, and show** — the gap where most paid leads die before sales ever speaks to them.

## Step 1: Map the Current Funnel

Ask (or infer from `$ARGUMENTS` and project docs):
1. Lead source(s) and daily volume
2. Current first-response time and channel(s)
3. Conversion points: lead → response → booked → showed → closed (rates if known)
4. Who follows up — humans, automation, or nobody?

<context>
@README.md
</context>

## Step 2: Audit Against the Four Pillars

| Pillar | Standard | Common failure |
|--------|----------|----------------|
| **Availability** | Contactable on the lead's channel, human answer during stated hours, 7-day coverage | Office-hours-only for leads generated 24/7 |
| **Speed** | First contact within 1-5 minutes of opt-in — contact rates collapse within the first hour | "We call back within 24 hours" |
| **Personalisation** | Reference their name, source, and the specific thing they asked about | Same script for every lead |
| **Volume** | Multiple attempts across multiple channels over multiple days — most contacts happen after attempt 3 | One call, one email, give up |

Score each pillar 1-10 for the current setup and name the single biggest leak.

## Step 3: Build the Sequences

Generate all four, adapted to the business:

### A. Speed-to-Lead (minutes 0-60)
- Instant reply (SMS/email/WhatsApp) within 1 min: confirm receipt, ask one easy engagement question
- Call attempt within 5 min; voicemail script + follow-up text ("just tried you — reply 1 for morning, 2 for afternoon")
- Double-dial pattern and second attempt inside the hour

### B. Lead-to-Booking (days 0-14)
- 8-12 touches across at least 2 channels, front-loaded (days 0-3 daily, then tapering)
- Every message: personal, short, one question, easy next step (booking link)
- Rotate value angles: answer a common question, share a result, address the likely objection, "quick question" re-open

### C. Booking-to-Show (booking → appointment)
- Instant confirmation with calendar invite + what-to-expect
- Value touch the day before (short video/case study: "watch this before we talk")
- Morning-of reminder with easy reschedule path
- Show-rate target: 70%+; below 50% means the gap between booking and call is too long — tighten to <48h

### D. No-Show / Gone-Cold Recovery
- Same-day "we missed you" + one-click rebook
- 3-touch revival over a week, then move to long-term nurture list
- 30/60/90-day reactivation: new result, new offer, or a direct "are you still working on [problem]?" 9-word email

## Step 4: Output

```markdown
# Lead Nurture System: [Business]

## Pillar Audit
[Table + biggest leak]

## Sequences
[A-D above, every message written out verbatim with send timing, channel, and merge fields]

## Metrics to Track Weekly
- Speed to first contact (median minutes)
- Contact rate / booking rate / show rate
- Attempts per contact
```

Save to: `docs/marketing/nurture-system-[date].md`

## Rules

- Every message must be sendable as-is — no "[insert value here]" placeholders except real user data merge fields.
- Short beats clever: 1-3 sentences per SMS, under 100 words per email in this context.
- This is lead-to-appointment follow-up; for marketing broadcasts and onboarding stories use `/emailseq`.
