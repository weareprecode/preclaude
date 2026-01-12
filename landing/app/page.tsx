"use client";

import { useState } from "react";
import {
  Terminal,
  Zap,
  Users,
  Bot,
  Copy,
  Check,
  GitBranch,
  Code,
  Shield,
  FileText,
  Rocket,
  ExternalLink,
} from "lucide-react";

const commands = [
  { name: "/commit", desc: "Conventional commit from staged changes" },
  { name: "/review", desc: "Comprehensive code review" },
  { name: "/full-build", desc: "PRD -> Ralph -> Autonomous Build" },
  { name: "/kickoff", desc: "Initialise new project with structure" },
  { name: "/prd", desc: "Generate technical PRD" },
  { name: "/implement", desc: "Feature implementation" },
  { name: "/marketing", desc: "Multi-platform content" },
  { name: "/deploy-check", desc: "Pre-deployment checklist" },
];

const agents = [
  { name: "@frontend-developer", desc: "React, Next.js, UI" },
  { name: "@backend-developer", desc: "APIs, databases" },
  { name: "@expo-developer", desc: "React Native, Expo" },
  { name: "@ios-developer", desc: "Swift, SwiftUI" },
  { name: "@android-developer", desc: "Kotlin, Compose" },
  { name: "@devops-engineer", desc: "CI/CD, Docker" },
  { name: "@security-auditor", desc: "Security review" },
  { name: "@test-engineer", desc: "Testing" },
];

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
      className="p-2 hover:bg-zinc-700 rounded transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
}

export default function Home() {
  const installCommand =
    "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-sm mb-6">
            <Terminal className="w-4 h-4 text-orange-400" />
            <span>For Claude Code CLI & IDE</span>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Preclaude</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Supercharge Claude Code with slash commands, specialist agents, and
            autonomous workflows
          </p>

          {/* Install Command */}
          <div className="code-block max-w-2xl mx-auto flex items-center justify-between gap-4">
            <code className="text-orange-400 text-sm break-all">
              {installCommand}
            </code>
            <CopyButton text={installCommand} />
          </div>

          <p className="text-sm text-zinc-500 mt-4">
            Works on macOS and Linux. Requires git.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Commands */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">12 Slash Commands</h3>
              <p className="text-zinc-400 text-sm mb-4">
                From commits to full autonomous builds
              </p>
              <div className="space-y-2">
                {commands.slice(0, 4).map((cmd) => (
                  <div
                    key={cmd.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <code className="text-orange-400">{cmd.name}</code>
                    <span className="text-zinc-500">{cmd.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agents */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">13 Specialist Agents</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Expert personas for specific tasks
              </p>
              <div className="space-y-2">
                {agents.slice(0, 4).map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <code className="text-blue-400">{agent.name}</code>
                    <span className="text-zinc-500">{agent.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ralph */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ralph Autonomous Builder</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Build entire products autonomously
              </p>
              <div className="code-block text-sm">
                <code className="text-green-400">/full-build</code>
                <code className="text-zinc-400">
                  {" "}
                  &quot;Invoice tracker&quot;
                </code>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                PRD -{">"} Stories -{">"} Build -{">"} Test -{">"} Commit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Install</h3>
              <p className="text-sm text-zinc-400">
                One command clones the repo and sets up symlinks
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Customise</h3>
              <p className="text-sm text-zinc-400">
                Edit CLAUDE.md for your preferences and permissions
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Use Everywhere</h3>
              <p className="text-sm text-zinc-400">
                Commands and agents available in every Claude Code session
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Links */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Documentation</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://github.com/weareprecode/preclaude/blob/main/docs/COMMANDS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3"
            >
              <Code className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-semibold">Commands</h3>
                <p className="text-sm text-zinc-400">All 12 slash commands</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
            </a>

            <a
              href="https://github.com/weareprecode/preclaude/blob/main/docs/AGENTS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-semibold">Agents</h3>
                <p className="text-sm text-zinc-400">13 specialist personas</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
            </a>

            <a
              href="https://github.com/weareprecode/preclaude/blob/main/docs/RALPH-WALKTHROUGH.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3"
            >
              <Rocket className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="font-semibold">Ralph</h3>
                <p className="text-sm text-zinc-400">Autonomous builds</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-zinc-500">
          <p>CC BY-NC 4.0</p>
          <a
            href="https://github.com/weareprecode/preclaude"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
