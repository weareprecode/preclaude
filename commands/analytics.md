---
description: Check analytics setup and guide installation of PostHog, Google Analytics, or other providers
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
argument-hint: [posthog|google|plausible|check]
---

# Analytics Setup

Check if analytics is installed and guide setup of PostHog, Google Analytics, Plausible, or other providers.

## Phase 1: Check Current Setup

Scan for existing analytics:

```bash
# Check package.json for analytics packages
cat package.json | grep -E "posthog|analytics|gtag|ga-4|plausible|mixpanel|amplitude|segment" || echo "No analytics packages found"

# Check for analytics files
find . -name "*analytics*" -o -name "*tracking*" -o -name "*posthog*" -o -name "*gtag*" 2>/dev/null | grep -v node_modules | head -10

# Check env files for analytics keys
grep -r "ANALYTICS\|POSTHOG\|GA_\|GTAG\|PLAUSIBLE\|MIXPANEL" .env* 2>/dev/null || echo "No analytics env vars found"
```

### Report Current Status

```markdown
## 📊 Analytics Audit

### Currently Installed
- [list any found analytics]

### Not Found
- No analytics detected
```

## Phase 2: Recommend Provider

If no analytics found, ask user:

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which analytics provider would you like to set up?",
    "header": "Analytics",
    "options": [
      {"label": "PostHog (Recommended)", "description": "Product analytics, session replay, feature flags - generous free tier"},
      {"label": "Google Analytics", "description": "Free, widely used, good for marketing metrics"},
      {"label": "Plausible", "description": "Privacy-focused, simple, lightweight"},
      {"label": "Vercel Analytics", "description": "Built-in if hosting on Vercel - Web Vitals focus"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 3: Install Selected Provider

### PostHog Setup

```bash
npm install posthog-js
```

**Create Provider:**

```typescript
// app/providers/posthog.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We capture manually
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

**Create PageView Tracker:**

```typescript
// app/providers/posthog-pageview.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, Suspense } from "react";

function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
```

**Update Layout:**

```typescript
// app/layout.tsx
import { PostHogProvider } from "./providers/posthog";
import { PostHogPageView } from "./providers/posthog-pageview";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          <PostHogPageView />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

**Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

**Get Your Keys:**
1. Sign up at https://posthog.com
2. Create a project
3. Go to Settings → Project API Key
4. Copy the key to your `.env.local`

---

### Google Analytics Setup

```bash
npm install @next/third-parties
```

**Add to Layout:**

```typescript
// app/layout.tsx
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
```

**Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Get Your ID:**
1. Go to https://analytics.google.com
2. Create a property
3. Get your Measurement ID (starts with G-)

---

### Plausible Setup

```bash
npm install next-plausible
```

**Add to Layout:**

```typescript
// app/layout.tsx
import PlausibleProvider from "next-plausible";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PlausibleProvider domain="yourdomain.com">
          {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
```

**Or Self-Hosted:**

```typescript
<PlausibleProvider
  domain="yourdomain.com"
  customDomain="https://plausible.yourdomain.com"
  selfHosted
>
```

---

### Vercel Analytics Setup

```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Add to Layout:**

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

No API keys needed - automatically works when deployed to Vercel.

---

## Phase 4: Add Common Events

After installing, suggest common events to track:

```typescript
// lib/analytics.ts
import posthog from "posthog-js";

export const analytics = {
  // User actions
  signUp: (method: string) => posthog.capture("user_signed_up", { method }),
  signIn: (method: string) => posthog.capture("user_signed_in", { method }),
  signOut: () => posthog.capture("user_signed_out"),

  // Feature usage
  featureUsed: (feature: string) => posthog.capture("feature_used", { feature }),

  // Conversion events
  startedTrial: () => posthog.capture("trial_started"),
  subscribed: (plan: string) => posthog.capture("subscribed", { plan }),

  // Engagement
  buttonClicked: (button: string, location: string) =>
    posthog.capture("button_clicked", { button, location }),
  formSubmitted: (form: string) => posthog.capture("form_submitted", { form }),
};
```

## Phase 5: Summary

```markdown
## ✅ Analytics Setup Complete

### Installed
- [Provider name]
- PageView tracking
- Event helpers

### Environment Variables Needed
Add to `.env.local`:
```
[ENV_VAR_NAME]=[your-key-here]
```

### Next Steps
1. Get API key from [provider dashboard link]
2. Add key to `.env.local`
3. Deploy and verify tracking works
4. Set up conversion goals in dashboard

### Verify Installation
- Check Network tab for tracking requests
- View real-time dashboard in [provider]
- Test a few pageviews and events
```
