import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/content/schema";
import { SOCIAL_ICONS } from "@/lib/social";

const NAV = [
  { href: "/#about", label: "About" },
  { href: "/#stack", label: "Stack & services" },
  { href: "/#work", label: "Projects" },
  { href: "/#resume", label: "Resume" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

export default function Footer({ site }: { site: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t pt-16">
      <div className="shell">
        <div className="grid gap-10 pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Let&apos;s build something people love.</p>
            <p className="mt-2 max-w-sm text-soft">{site.role} · {site.location}</p>
            <Link href="/#contact" className="btn-primary mt-6">
              Start a conversation <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <nav aria-label="Footer">
            <p className="label">Explore</p>
            <ul className="grid gap-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-soft transition hover:text-fg">{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="label">Connect</p>
            <ul className="grid gap-2">
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="break-all text-soft hover:text-fg">{site.email}</a>
                </li>
              )}
              {site.socials?.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform];
                return (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2 text-soft hover:text-fg">
                      {Icon && <Icon className="h-4 w-4" />} {s.platform}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-2 border-t py-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="font-mono">Built with Next.js · Designed & engineered by me</p>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center text-[18vw] font-bold leading-[0.8] tracking-tighter text-fg/[0.04]">
        {site.shortName || site.name}
      </p>
    </footer>
  );
}
