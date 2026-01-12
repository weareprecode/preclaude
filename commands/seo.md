---
description: Audit and fix SEO essentials - meta tags, Open Graph, favicon, sitemap, robots.txt
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch
model: opus
argument-hint: [fix|audit]
---

# SEO Audit & Fix

Comprehensive SEO check for your project. Ensures all essential SEO elements are in place.

## Phase 1: Audit

Scan the project for SEO essentials:

```bash
# Find layout/metadata files
find . -name "layout.tsx" -o -name "layout.js" -o -name "_app.tsx" -o -name "head.tsx" 2>/dev/null | grep -v node_modules | head -10
```

### Checklist

| Item | Status | Location |
|------|--------|----------|
| **Page Title** | ⬜ | `metadata.title` in layout.tsx |
| **Meta Description** | ⬜ | `metadata.description` in layout.tsx |
| **Open Graph Title** | ⬜ | `metadata.openGraph.title` |
| **Open Graph Description** | ⬜ | `metadata.openGraph.description` |
| **Open Graph Image** | ⬜ | `metadata.openGraph.images` (1200x630px) |
| **Twitter Card** | ⬜ | `metadata.twitter` |
| **Favicon** | ⬜ | `app/favicon.ico` or `app/icon.tsx` |
| **Apple Touch Icon** | ⬜ | `app/apple-icon.png` (180x180px) |
| **Sitemap** | ⬜ | `app/sitemap.ts` or `public/sitemap.xml` |
| **Robots.txt** | ⬜ | `app/robots.ts` or `public/robots.txt` |
| **Canonical URLs** | ⬜ | `metadata.metadataBase` |
| **Structured Data** | ⬜ | JSON-LD in layout or pages |

### Check Each Item

**1. Metadata in Layout**
```typescript
// app/layout.tsx - check for:
export const metadata: Metadata = {
  title: { default: "Site Name", template: "%s | Site Name" },
  description: "...",
  metadataBase: new URL("https://example.com"),
  openGraph: { ... },
  twitter: { ... },
};
```

**2. Favicon**
```bash
ls -la app/favicon.ico app/icon.* public/favicon.ico 2>/dev/null
```

**3. Sitemap**
```bash
ls -la app/sitemap.ts public/sitemap.xml 2>/dev/null
```

**4. Robots.txt**
```bash
ls -la app/robots.ts public/robots.txt 2>/dev/null
```

**5. Open Graph Image**
```bash
ls -la app/opengraph-image.* public/og-image.* public/og.png 2>/dev/null
```

## Phase 2: Report

Show audit results:

```markdown
## 🔍 SEO Audit Results

### ✅ Found
- [list items that exist]

### ❌ Missing
- [list items that don't exist]

### ⚠️ Needs Improvement
- [list items that exist but are incomplete]
```

## Phase 3: Fix (if requested)

If $ARGUMENTS contains "fix" or user confirms, create missing items:

### Create Metadata (if missing)

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "[Project Name]",
    template: "%s | [Project Name]",
  },
  description: "[Project description - 150-160 chars]",
  metadataBase: new URL("https://[domain].com"),
  openGraph: {
    title: "[Project Name]",
    description: "[Project description]",
    url: "https://[domain].com",
    siteName: "[Project Name]",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "[Project Name]",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "[Project Name]",
    description: "[Project description]",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### Create Sitemap (if missing)

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://[domain].com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add other pages
  ];
}
```

### Create Robots.txt (if missing)

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://[domain].com/sitemap.xml",
  };
}
```

### Create Favicon (if missing)

```typescript
// app/icon.tsx - Dynamic favicon
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        [X]
      </div>
    ),
    { ...size }
  );
}
```

### Open Graph Image Prompt

If OG image is missing, generate a prompt for Midjourney/DALL-E/Napkin:

```markdown
## 🎨 Open Graph Image Needed

**Size**: 1200 x 630 pixels
**Format**: PNG or JPG
**Location**: Save to `public/og-image.png`

### Napkin.ai Prompt
```
Create a minimalist Open Graph image for "[Project Name]".

Style: Modern, clean, dark background (#000 or #0a0a0a)
Text: "[Project Name]" in bold white text, centered
Subtext: "[Tagline]" in grey (#858585) below
Accent: [Brand colour] subtle glow or gradient

No complex graphics. Focus on typography and whitespace.
Dimensions: 1200x630px
```

### Alternative: Code-Generated OG Image

```typescript
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "[Project Name]";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 20,
          }}
        >
          [Project Name]
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#858585",
          }}
        >
          [Tagline]
        </div>
      </div>
    ),
    { ...size }
  );
}
```

## Phase 4: Summary

```markdown
## ✅ SEO Setup Complete

### Created
- [list of files created]

### Still Needed
- [ ] Upload custom favicon (replace generated one)
- [ ] Create/upload OG image using prompt above
- [ ] Update domain in metadata once deployed
- [ ] Add page-specific metadata to individual pages

### Verify
After deployment, test with:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
```
