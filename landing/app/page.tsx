"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

// Animation variants
const smoothEasing: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEasing }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Data - All 24 commands
const commands = [
  { name: "/full-build", desc: "Complete workflow: PRD -> prd.json -> Build (Ralph Wiggum)" },
  { name: "/implement", desc: "Execute full feature implementation from PRD through completion" },
  { name: "/prd", desc: "Generate a comprehensive technical PRD for a product or feature MVP" },
  { name: "/kickoff", desc: "Initialize new project with full structure, CLAUDE.md, and tooling" },
  { name: "/prd-json", desc: "Convert PRD to prd.json format for autonomous build" },
  { name: "/build", desc: "Run Ralph Wiggum autonomous loop with completion promise" },
  { name: "/research", desc: "Deep research on competitors, market gaps, and idea validation" },
  { name: "/commit", desc: "Create conventional commit from staged changes" },
  { name: "/pr", desc: "Create pull request with auto-generated description" },
  { name: "/review", desc: "Comprehensive code review of staged or recent changes" },
  { name: "/test", desc: "Generate tests for existing code - unit, integration, or E2E" },
  { name: "/debug", desc: "Analyse error messages and suggest fixes" },
  { name: "/status", desc: "Quick health check - git, lint, types, tests in one view" },
  { name: "/polish", desc: "Polish UI to match a design reference - URL, Figma, or screenshot" },
  { name: "/refactor", desc: "Refactor code - extract components, improve types, split files" },
  { name: "/migrate", desc: "Run migrations - database, Next.js upgrades, dependency updates" },
  { name: "/deps", desc: "Check dependencies - outdated packages, security, bundle size" },
  { name: "/seo", desc: "Audit and fix SEO - meta tags, Open Graph, favicon, sitemap" },
  { name: "/analytics", desc: "Check and setup analytics - PostHog, Google Analytics, Plausible" },
  { name: "/learn", desc: "Analyze session, score learnings, propose CLAUDE.md updates" },
  { name: "/marketing", desc: "Generate marketing content from feature or release" },
  { name: "/stakeholder", desc: "Generate stakeholder updates - daily, weekly, or full pack" },
  { name: "/project-complete", desc: "Generate end-of-project documentation suite" },
  { name: "/handoff", desc: "Create session handoff notes for continuity" },
  { name: "/deploy-check", desc: "Pre-deployment verification checklist" },
];

// Data - All 15 agents
const agents = [
  { name: "@frontend-developer", desc: "React, Next.js, UI components, state management" },
  { name: "@backend-developer", desc: "APIs, server-side logic, database operations" },
  { name: "@database-architect", desc: "Schema design, queries, migrations, indexing" },
  { name: "@devops-engineer", desc: "CI/CD, Docker, Kubernetes, infrastructure" },
  { name: "@security-auditor", desc: "Security reviews, vulnerability analysis" },
  { name: "@test-engineer", desc: "Unit tests, integration tests, E2E tests" },
  { name: "@code-reviewer", desc: "Code review, best practices" },
  { name: "@technical-writer", desc: "Documentation, guides, tutorials" },
  { name: "@ui-designer", desc: "Design systems, accessibility, animations" },
  { name: "@ux-researcher", desc: "User research, usability testing" },
  { name: "@product-analyst", desc: "PRDs, user stories, requirements" },
  { name: "@performance-engineer", desc: "Core Web Vitals, bundle analysis, optimisation" },
  { name: "@expo-developer", desc: "React Native with Expo" },
  { name: "@ios-developer", desc: "Swift, iOS development" },
  { name: "@android-developer", desc: "Kotlin, Android development" },
];

// FAQ Data
const faqs = [
  {
    question: "What is Preclaude?",
    answer: "Preclaude is a pre-configured setup for Claude Code that includes 24 slash commands, 15 specialist agents, and Ralph - an autonomous builder. It supercharges your Claude Code experience with production-ready workflows."
  },
  {
    question: "How do I install Preclaude?",
    answer: "Simply run the install command in your terminal: curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash. It works on macOS and Linux."
  },
  {
    question: "What is Ralph?",
    answer: "Ralph is an autonomous builder that takes your PRD (Product Requirements Document) and builds it story by story, committing as it goes. It reads prd.json, implements stories one at a time, runs typecheck/lint/tests, and commits automatically."
  },
  {
    question: "Do I need Claude Code installed first?",
    answer: "Yes, Preclaude requires Claude Code to be installed. It extends Claude Code with additional commands, agents, and workflows."
  },
  {
    question: "Is Preclaude free to use?",
    answer: "Yes, Preclaude is open source and released under the MIT License. You can use it freely in personal and commercial projects."
  },
  {
    question: "Can I customise the commands and agents?",
    answer: "Absolutely! All commands and agents are stored as markdown files in your ~/.claude directory. You can modify existing ones or add your own."
  },
  {
    question: "What's the difference between commands and agents?",
    answer: "Commands (/command) are specific workflows like /commit or /review. Agents (@agent) are specialist personas like @frontend-developer or @security-auditor that bring domain expertise to conversations."
  },
];

// Copy button component
function CopyButton() {
  const [copied, setCopied] = useState(false);
  const installCommand = "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-[7px] bg-[#0A0908] hover:bg-[#1a1918] transition-colors flex-shrink-0"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 11L9 15L17 7" stroke="#9C9C99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <Image src="/copy-icon.svg" alt="Copy" width={22} height={22} />
      )}
    </button>
  );
}

// Mobile menu component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 bg-[#171615] border border-[#2D2B2B] rounded-xl p-4 z-50 md:hidden"
          >
            <div className="flex flex-col gap-2">
              <a href="#ralph" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Ralph</a>
              <a href="#commands" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Slash Commands</a>
              <a href="#agents" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Agents</a>
              <a href="#faqs" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">FAQs</a>
              <a href="#" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Blog</a>
              <hr className="border-[#2D2B2B] my-2" />
              <a
                href="https://github.com/weareprecode/preclaude"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                View Github
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Command card component
function CommandCard({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-5 sm:p-6 rounded-xl bg-[#171615] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1a1918] transition-all duration-300"
    >
      <code className="text-white font-mono text-base sm:text-lg font-medium">{name}</code>
      <p className="mt-2 sm:mt-3 text-[#9C9C99] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Agent card component
function AgentCard({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-5 sm:p-6 rounded-xl bg-[#171615] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1a1918] transition-all duration-300"
    >
      <code className="text-white font-mono text-base sm:text-lg font-medium">{name}</code>
      <p className="mt-2 sm:mt-3 text-[#9C9C99] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="faq-item pb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-2 text-left"
      >
        <span className="text-sm sm:text-base text-white" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Image src="/chevron-down.svg" alt="" width={16} height={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[#9C9C99] leading-relaxed pb-2">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// FAQ Section Component
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-[538px] mx-auto">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const installCommand = "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  return (
    <main className="min-h-screen bg-[#0A0908] overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-10 py-2.5">
        <div className="flex items-center gap-4">
          {/* Brand */}
          <a href="/" className="flex items-center gap-1.5">
            <Image src="/logo-icon.svg" alt="Preclaude" width={29} height={29} />
            <span className="text-lg sm:text-xl font-medium text-[#FFFCF9] tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
              Preclaude
            </span>
          </a>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#ralph" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Ralph</a>
            <a href="#commands" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Slash Commands</a>
            <a href="#agents" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Agents</a>
            <a href="#faqs" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">FAQs</a>
            <a href="#" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Blog</a>
          </div>
        </div>

        {/* GitHub Button - Desktop */}
        <a
          href="https://github.com/weareprecode/preclaude"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex px-3 py-1.5 text-base text-white border border-white rounded-full hover:bg-white/10 transition-colors"
        >
          View Github
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Hero Section */}
      <section className="px-4 pt-12 sm:pt-20 pb-12 sm:pb-20">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center gap-5 sm:gap-7"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-[64px] font-bold leading-[1.1] text-white"
            >
              Supercharge Your<br className="sm:hidden" /><span className="hidden sm:inline">&nbsp;</span>Claude Code
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-xl text-[#9C9C99] max-w-[780px] leading-relaxed px-2"
            >
              24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.
            </motion.p>

            {/* Install Command */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-[17px] py-3 sm:py-3.5 bg-[#171615] border border-[#2D2B2B] rounded-[7px] w-full max-w-full sm:max-w-fit overflow-hidden"
            >
              <code className="text-xs sm:text-sm text-white font-mono truncate flex-1 sm:flex-none sm:max-w-[568px]">
                {installCommand}
              </code>
              <CopyButton />
            </motion.div>

            {/* GitHub Button */}
            <motion.div variants={fadeInUp}>
              <a
                href="https://github.com/weareprecode/preclaude"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base text-white border border-[#CDCDC9] rounded-full hover:bg-white/10 transition-colors"
              >
                View Github
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 sm:mt-16 rounded-xl sm:rounded-[18px] overflow-hidden"
          >
            <Image
              src="/hero-screenshot.png"
              alt="Ralph autonomous builder running in Cursor IDE"
              width={2560}
              height={1761}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Ralph Section */}
      <section id="ralph" className="px-4 py-12 sm:py-20">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="bg-[#171615] rounded-lg p-4 sm:p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Ralph Screenshot */}
                <motion.div variants={fadeInUp} className="md:w-1/2">
                  <div className="rounded-[9px] overflow-hidden">
                    <Image
                      src="/ralph-screenshot.png"
                      alt="Ralph builder interface"
                      width={1208}
                      height={654}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>

                {/* Ralph Content */}
                <motion.div variants={fadeInUp} className="md:w-1/2 flex flex-col justify-center p-2 sm:p-6">
                  <div className="space-y-2 mb-4 sm:mb-5">
                    <h2 className="text-2xl sm:text-[32px] font-semibold text-white leading-tight">
                      Meet&nbsp;Ralph
                    </h2>
                    <p className="text-sm sm:text-base text-[#9C9C99]">
                      Your Autonomous Builder
                    </p>
                  </div>

                  <p className="text-sm text-white leading-relaxed mb-4">
                    Ralph takes your PRD and builds it story by story, committing as it goes. No hand-holding required — just set iterations and let Ralph work.
                  </p>

                  <ul className="space-y-2 text-sm text-white list-disc list-inside mb-4">
                    <li>Reads prd.json for user stories</li>
                    <li>Implements one story at a time</li>
                    <li>Runs typecheck, lint, and tests</li>
                    <li>Commits and moves to next story</li>
                  </ul>

                  <p className="text-xs text-[#666665]">
                    Powered by{" "}
                    <a
                      href="https://github.com/anthropics/claude-code/tree/main/plugins/official/ralph-loop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#9C9C99] transition-colors"
                    >
                      Ralph Wiggum
                    </a>
                    {" "}by{" "}
                    <a
                      href="https://github.com/ghuntley"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#9C9C99] transition-colors"
                    >
                      Geoffrey Huntley
                    </a>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commands Section */}
      <section id="commands" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-[1.1]">
                <span className="text-white">24</span> Slash Commands
              </h2>
              <p className="text-base sm:text-xl text-[#9C9C99] max-w-2xl mx-auto">
                From project kickoff to deployment — every workflow covered.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {commands.map((cmd) => (
                <CommandCard key={cmd.name} name={cmd.name} desc={cmd.desc} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-[1.1]">
                <span className="text-white">15</span> Specialist Agents
              </h2>
              <p className="text-base sm:text-xl text-[#9C9C99] max-w-2xl mx-auto">
                Expert knowledge for every part of your stack.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {agents.map((agent) => (
                <AgentCard key={agent.name} name={agent.name} desc={agent.desc} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="px-4 py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col items-center gap-6 sm:gap-10"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center px-2">
              <h2 className="text-2xl sm:text-4xl md:text-[48px] font-bold text-white leading-tight mb-2">
                Frequently asked questions
              </h2>
              <p className="text-base sm:text-xl text-white">
                Everything you need to know about Preclaude
              </p>
            </motion.div>

            {/* FAQ Accordion - Centered */}
            <motion.div variants={fadeInUp} className="w-full flex justify-center px-2 sm:px-0">
              <FAQSection />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 sm:py-12">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bg-[#171615] rounded-2xl sm:rounded-[31px] py-8 sm:py-12 px-4 sm:px-8 flex flex-col items-center"
          >
            {/* Icon */}
            <motion.div variants={fadeInUp} className="mb-2">
              <Image src="/cta-icon.svg" alt="" width={88} height={87} className="w-16 h-16 sm:w-[88px] sm:h-[87px]" />
            </motion.div>

            {/* Headline */}
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-5xl md:text-[60px] font-bold text-[#FFFCF9] leading-tight text-center mb-2 sm:mb-3">
              Ready to Start?
            </motion.h2>

            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="text-base sm:text-xl text-[#FFFCF9] text-center mb-4 sm:mb-6">
              One command. That&apos;s it.
            </motion.p>

            {/* Install Command */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[640px]">
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-[17px] py-3 sm:py-3.5 bg-[#0A0908] border border-[#2D2B2B] rounded-[7px] w-full justify-center overflow-hidden">
                <code className="text-xs sm:text-sm text-white font-mono truncate flex-1 text-center">
                  {installCommand}
                </code>
                <CopyButton />
              </div>
              <p className="text-xs text-[#EEEBE8] text-center px-2">
                Works on macOS and Linux. Requires{" "}
                <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="underline">
                  Claude Code
                </a>
                {" "}to be installed.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 pb-10">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Brand */}
            <a href="/" className="flex items-center gap-1.5">
              <Image src="/logo-icon.svg" alt="Preclaude" width={29} height={29} />
              <span className="text-lg sm:text-xl font-medium text-white tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                Preclaude
              </span>
            </a>
            <span className="text-xs text-[#666665]">MIT License</span>
          </div>

          {/* GitHub Mark */}
          <a
            href="https://github.com/weareprecode/preclaude"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Image src="/github-mark.svg" alt="View on GitHub" width={215} height={25} />
          </a>

          {/* Mobile GitHub Link */}
          <a
            href="https://github.com/weareprecode/preclaude"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden text-sm text-[#666665] underline"
          >
            View on GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
