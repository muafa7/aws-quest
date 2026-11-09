import Link from "next/link";
import { Suspense } from "react";
import { SiteNav } from "./site-nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="site-container site-header__inner">
          <Link href="/" className="site-brand" aria-label="AWS Quest home">
            <span className="site-brand__mark" aria-hidden="true">AQ</span>
            <span><span className="site-brand__name">AWS<span> QUEST</span></span><span className="site-brand__tagline">Certification Trainer</span></span>
          </Link>
          <Suspense fallback={<div className="site-nav site-nav--loading" aria-hidden="true" />}><SiteNav /></Suspense>
        </div>
      </header>
      {children}
      <footer className="site-container site-footer">
        <span className="site-footer__mark" aria-hidden="true">AQ</span>
        <p>Built for retrieval practice <span aria-hidden="true">&mdash;</span> not exam dumps.</p>
        <span className="footer-pixels" aria-hidden="true"><i /><i /><i /><i /></span>
      </footer>
    </div>
  );
}
