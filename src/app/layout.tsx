import type { Metadata } from "next";
import { Outfit, Silkscreen, Source_Sans_3 } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const display = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
const hud = Silkscreen({ subsets: ["latin"], weight: "400", variable: "--font-silkscreen", display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "AWS Quest", template: "%s | AWS Quest" },
  description: "A retro-style AWS certification learning app with adaptive practice and mock exams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable} ${hud.variable}`}><body><SiteShell>{children}</SiteShell></body></html>;
}
