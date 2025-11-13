import Script from "next/script";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FollowUP Copilot",
  description:
    "Experiencia embebida de AgentKit + ChatKit optimizada para seguimientos y clarificaciones contextuales.",
  icons: {
    icon: "/logo-fup-favicon.png",
    shortcut: "/logo-fup-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta
          name="openai-domain-verification"
          content="domain_pk_691643de69548197bbc9bfe2225ae04b01055b658242dce2"
        />
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
