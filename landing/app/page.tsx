"use client";

import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, Terminal, Zap, Bot, GitBranch } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
  { name: "/full-build", desc: "Full workflow from idea to autonomous execution (PRD -> Ralph -> Build)" },
  { name: "/implement", desc: "Execute full feature implementation from PRD through completion" },
  { name: "/prd", desc: "Generate a comprehensive technical PRD for a product or feature MVP" },
  { name: "/kickoff", desc: "Initialize new project with full structure, CLAUDE.md, and tooling" },
  { name: "/ralph", desc: "Convert PRD to prd.json format for autonomous Ralph execution" },
  { name: "/build", desc: "Run Ralph autonomous build loop on existing prd.json" },
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

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <Copy className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );
}

// Command card component
function CommandCard({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/50 hover:bg-white/[0.05] transition-all duration-300"
    >
      <code className="text-orange-400 font-mono text-lg font-medium">{name}</code>
      <p className="mt-2 text-[#858585] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Agent card component
function AgentCard({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.05] transition-all duration-300"
    >
      <code className="text-blue-400 font-mono text-lg font-medium">{name}</code>
      <p className="mt-2 text-[#858585] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  const installCommand = "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#858585] mb-8"
          >
            <Terminal className="w-4 h-4" />
            Open Source CLI Tool
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Supercharge Your{" "}
            <span className="gradient-text">Claude Code</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#858585] max-w-3xl mx-auto mb-10"
          >
            24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <a
              href="#install"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Get Started
            </a>
            <a
              href="https://github.com/weareprecode/preclaude"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 font-medium hover:bg-white/20 transition-colors"
            >
              <GitBranch className="w-5 h-5" />
              View on GitHub
            </a>
          </motion.div>

          {/* Hero Image Stack */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mx-auto max-w-5xl"
          >
            {/* Background image - blurred, scaled */}
            <div className="absolute inset-0 scale-105 blur-2xl opacity-40">
              <Image
                src="/hero-screenshot.png"
                alt=""
                fill
                className="object-cover rounded-3xl"
                priority
              />
            </div>
            {/* Foreground image - sharp */}
            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-orange-500/10">
              <Image
                src="/hero-screenshot.png"
                alt="Ralph autonomous builder running in Cursor IDE"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ralph Section */}
      <section className="px-4 py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            {/* Avatar */}
            <motion.div variants={fadeInUp} className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-green-500/20 rounded-full scale-150" />
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <Image
                    src="https://i0.wp.com/dmdave.com/wp-content/uploads/2019/08/ralph-3945887244-1566174955905.jpg?fit=1196%2C673&ssl=1"
                    alt="Ralph"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={fadeInUp} className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Meet <span className="text-green-400">Ralph</span>
              </h2>
              <p className="text-xl text-[#858585] mb-8">
                Your Autonomous Builder
              </p>
              <p className="text-[#858585] mb-8 leading-relaxed">
                Ralph takes your PRD and builds it story by story, committing as it goes.
                No hand-holding required — just set iterations and let Ralph work.
              </p>
              <ul className="space-y-4 text-left">
                {[
                  "Reads prd.json for user stories",
                  "Implements one story at a time",
                  "Runs typecheck, lint, and tests",
                  "Commits and moves to next story",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#858585]">
                    <Bot className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="px-4 py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-orange-400">24</span> Slash Commands
              </h2>
              <p className="text-xl text-[#858585] max-w-2xl mx-auto">
                From project kickoff to deployment — every workflow covered.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {commands.map((cmd) => (
                <CommandCard key={cmd.name} name={cmd.name} desc={cmd.desc} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section className="px-4 py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-blue-400">15</span> Specialist Agents
              </h2>
              <p className="text-xl text-[#858585] max-w-2xl mx-auto">
                Expert knowledge for every part of your stack.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {agents.map((agent) => (
                <AgentCard key={agent.name} name={agent.name} desc={agent.desc} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Install Section */}
      <section id="install" className="px-4 py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Start?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-[#858585] mb-12">
              One command. That&apos;s it.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <code className="font-mono text-sm md:text-base text-orange-400 overflow-x-auto whitespace-nowrap flex-1">
                  {installCommand}
                </code>
                <CopyButton text={installCommand} />
              </div>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-8 text-[#858585] text-sm">
              Works on macOS and Linux. Requires{" "}
              <a
                href="https://docs.anthropic.com/en/docs/claude-code"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
              >
                Claude Code
              </a>{" "}
              to be installed.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#858585]">
            <Terminal className="w-5 h-5" />
            <span className="font-medium text-white">Preclaude</span>
            <span className="text-sm">MIT License</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/weareprecode/preclaude"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#858585] hover:text-white transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://precode.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#858585] hover:text-white transition-colors"
            >
              Built by Precode
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
