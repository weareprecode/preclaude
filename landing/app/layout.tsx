import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://preclaude.com"),
  title: "Preclaude - Supercharge Your Claude Code",
  description:
    "46 slash commands, 18 specialist agents, 12 auto-loading skills, and Ralph autonomous builder — all pre-configured and ready to use.",
  keywords: [
    "Claude Code",
    "Claude Code plugin",
    "Claude Code slash commands",
    "Claude Code agents",
    "Claude Code skills",
    "autonomous coding agent",
    "Ralph loop",
    "PRD generator",
    "AI coding workflows",
  ],
  alternates: {
    canonical: "https://preclaude.com",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Preclaude - Supercharge Your Claude Code",
    description:
      "46 slash commands, 18 specialist agents, 12 auto-loading skills, and Ralph autonomous builder — all pre-configured and ready to use.",
    type: "website",
    url: "https://preclaude.com",
    siteName: "Preclaude",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Preclaude - Supercharge Your Claude Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preclaude - Supercharge Your Claude Code",
    description:
      "46 slash commands, 18 specialist agents, 12 auto-loading skills, and Ralph autonomous builder — all pre-configured and ready to use.",
    images: ["/opengraph-image.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://preclaude.com/#software",
      name: "Preclaude",
      description:
        "Open-source enhancement pack for Claude Code: 46 slash commands, 18 specialist agents, 12 auto-loading skills, and the Ralph autonomous build loop — production-ready workflows from kickoff to launch.",
      url: "https://preclaude.com",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
      },
      license: "https://opensource.org/licenses/MIT",
      softwareVersion: "2.3.0",
      downloadUrl: "https://github.com/weareprecode/preclaude",
      sameAs: ["https://github.com/weareprecode/preclaude"],
      author: { "@id": "https://precode.co/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://precode.co/#organization",
      name: "Precode",
      url: "https://precode.co",
      description: "UK digital product agency — rapid MVP development and 5-Day UX Sprints.",
      sameAs: ["https://github.com/weareprecode"],
    },
    {
      "@type": "FAQPage",
      "@id": "https://preclaude.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Preclaude?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Preclaude is a pre-configured setup for Claude Code that includes 46 slash commands, 18 specialist agents, 12 auto-loading skills, and Ralph - an autonomous builder. It supercharges your Claude Code experience with production-ready workflows.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install Preclaude?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Two ways. As a Claude Code plugin (recommended): run /plugin marketplace add weareprecode/preclaude then /plugin install preclaude@preclaude inside Claude Code. Or via the terminal one-liner: curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash (macOS and Linux). Either way, restart Claude Code afterwards to load the new commands and agents.",
          },
        },
        {
          "@type": "Question",
          name: "Can I install just part of Preclaude?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Once you've added the marketplace, install a single bundle instead of the full pack: /plugin install preclaude-design@preclaude for the design commands, preclaude-build for PRDs and the Ralph build loop, preclaude-ship for review, tests and deploys, or preclaude-growth for offers, funnels, ads and email. Every command loads its description into Claude's context, so installing one slice keeps that context clear. Bundles are generated from the same files as the full pack, and installing more than one is fine.",
          },
        },
        {
          "@type": "Question",
          name: "What is Ralph?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ralph is an autonomous builder that takes your PRD (Product Requirements Document) and builds it story by story, committing as it goes. It reads prd.json, implements stories one at a time, runs typecheck/lint/tests, and commits automatically.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need Claude Code installed first?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Preclaude requires Claude Code to be installed. It extends Claude Code with additional commands, agents, and workflows.",
          },
        },
        {
          "@type": "Question",
          name: "Is Preclaude free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Preclaude is open source and released under the MIT License. You can use it freely in personal and commercial projects.",
          },
        },
        {
          "@type": "Question",
          name: "Can I customise the commands and agents?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely! Everything is plain markdown. With the installer, files live in ~/.preclaude (symlinked into ~/.claude) - edit them or add your own. With the plugin install, fork the repo, customise, and install your fork as your own marketplace.",
          },
        },
        {
          "@type": "Question",
          name: "What's the difference between commands, agents, and skills?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Commands (/command) are workflows you trigger explicitly, like /commit or /review. Agents (@agent) are specialist personas like @frontend-developer or @ai-engineer that bring domain expertise. Skills load automatically when the task matches - you don't invoke them, Claude picks them up when relevant.",
          },
        },
        {
          "@type": "Question",
          name: "What are the auto-loading skills?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Twelve packages of expertise Claude loads when the job matches: PRD generation, Ralph task conversion, project kickoff and completion, CLAUDE.md learning, marketing content, competitive landscape reports, design taste (aesthetic families, reference briefs and anti-slop guardrails), browser-based visual verification (Playwright), Better Auth setup with every gotcha handled, and a multi-model build pattern where Fable 5 scaffolds and Opus/Sonnet carry out the build.",
          },
        },
        {
          "@type": "Question",
          name: "What is the marketing engine?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An optional module of commands - /demo, /atomise, /listen, /launch, /scorecard, /ugc - that runs a founder-marketing loop: record a real demo, atomise it into a week of platform-native drafts, monitor conversations worth joining, generate launch packs, and score the week's numbers. It needs a private marketing-codex/ workspace with your voice and positioning, and it never publishes anything - every output is a draft for your approval.",
          },
        },
        {
          "@type": "Question",
          name: "Which Claude model do the commands use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your session's model. Commands inherit whatever model you're running Claude Code with, so they get better as models do. A couple of quick utility commands (/commit, /status, /update) pin Haiku deliberately to stay fast and cheap.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          async
          src="https://analytics.unified.studio/js/pa-4PhkA70me1kZ7o5hHf9NH.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </head>
      <body className="font-sans bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
