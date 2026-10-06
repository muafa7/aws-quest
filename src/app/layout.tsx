import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWS Quest",
  description: "A retro-style AWS certification learning app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
