"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const LINKS = [
  { href: "/#about", id: "about", label: "About" },
  { href: "/#stack", id: "stack", label: "Stack" },
  { href: "/#work", id: "work", label: "Work" },
  { href: "/#resume", id: "resume", label: "Resume" },
  { href: "/blog", id: "blog", label: "Blog" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export default function Navbar({ name, available }: { name: string; available?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section currently in the middle of the viewport.
  useEffect(() => {
    if (pathname !== "/") return;
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (l: (typeof LINKS)[number]) =>
    l.href === "/blog" ? pathname.startsWith("/blog") : pathname === "/" && active === l.id;
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-site items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-all duration-500 sm:px-4 ${
          scrolled
            ? "border-[rgb(var(--line)/0.1)] bg-bg/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${name.replace(/^Md\.?\s*/i, "")} — home`}
        >
          <span className="relative">
            <LogoMark className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
          </span>
          <span className="hidden text-sm font-semibold leading-tight sm:block">
            {name.replace(/^Md\.?\s*/i, "")}
            <span className="block font-mono text-[10.5px] font-normal text-muted">
              <span className="">&lt;</span>SoftwareEngineer{" "}
              <span className="">/&gt;</span>
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 rounded-full border bg-card/60 p-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <Link
                href={l.href}
                className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isActive(l) ? "text-bg" : "text-soft hover:text-fg"}`}
              >
                {isActive(l) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-fg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="btn-primary hidden !px-4 !py-2.5 sm:inline-flex"
          >
            Hire me <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border bg-card lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="panel mx-auto mt-2 max-w-site p-3 shadow-2xl lg:hidden"
          >
            <ul className="grid gap-1">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-lg font-medium hover:bg-elev"
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4 text-muted" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="btn-accent mt-3 w-full"
            >
              Hire me
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
