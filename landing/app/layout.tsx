import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Preclaude - Supercharge Claude Code",
  description:
    "Slash commands, specialist agents, and autonomous workflows for Claude Code",
  openGraph: {
    title: "Preclaude",
    description:
      "Supercharge Claude Code with slash commands, specialist agents, and autonomous workflows",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={mono.variable}>
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
