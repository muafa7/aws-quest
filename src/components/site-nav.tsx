"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArcadeIcon, type ArcadeIconName } from "./arcade-icon";

const nav: { label: string; href: string; icon: ArcadeIconName }[] = [
  { label: "Learn", href: "/learn", icon: "learn" },
  { label: "Practice", href: "/practice", icon: "practice" },
  { label: "Mock exam", href: "/mock", icon: "mock" },
  { label: "Progress", href: "/progress", icon: "progress" },
  { label: "History", href: "/history", icon: "history" },
];

export function SiteNav() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Keep the exam HUD below the actual header, including at zoomed font sizes.
    const header = ref.current?.closest("header");
    if (!header) return;
    const measure = () => document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  useEffect(() => {
    // Move only the horizontal nav scroller; never scroll the document on navigation.
    const active = ref.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active || !ref.current) return;
    const navBox = ref.current.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    if (activeBox.left < navBox.left) ref.current.scrollLeft -= navBox.left - activeBox.left + 4;
    else if (activeBox.right > navBox.right) ref.current.scrollLeft += activeBox.right - navBox.right + 4;
  }, [pathname]);

  return <nav ref={ref} className="site-nav" aria-label="Main navigation">{nav.map(({ label, href, icon }) => {
    const active = pathname === href || pathname?.startsWith(`${href}/`);
    return <Link key={href} href={href} className="site-nav__link" aria-current={active ? "page" : undefined}><ArcadeIcon name={icon} width={17} height={17} /><span>{label}</span></Link>;
  })}</nav>;
}
