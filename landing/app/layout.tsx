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
  title: "Preclaude - Supercharge Your Claude Code",
  description:
    "26 slash commands, 16 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Preclaude - Supercharge Your Claude Code",
    description:
      "26 slash commands, 16 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
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
      "26 slash commands, 16 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.",
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
      <head>
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          async
          src="https://plausible.io/js/pa-sDzX5DdCaN3WAe5t_iSIs.js"
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
