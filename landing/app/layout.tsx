import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  title: "Preclaude - Supercharge Your Claude Code",
  description:
    "24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Preclaude - Supercharge Your Claude Code",
    description:
      "24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
    type: "website",
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
      "24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
