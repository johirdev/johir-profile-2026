"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Bot, Briefcase, Cpu, ExternalLink, FileText, FolderKanban, GraduationCap, HelpCircle, Home, Inbox, KeyRound,
  LayoutDashboard, LogOut, Map, Menu, MessageSquareQuote, Settings2, ShieldCheck, Sparkles, User, Wrench, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { Session } from "@/server/auth";

const NAV: { group: string; items: { href: string; label: string; icon: typeof Home }[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Profile",
    items: [
      { href: "/admin/settings/hero", label: "Hero banner", icon: Sparkles },
      { href: "/admin/settings/about", label: "About me", icon: User },
      { href: "/admin/c/experiences", label: "Experience", icon: Briefcase },
      { href: "/admin/c/education", label: "Education", icon: GraduationCap },
      { href: "/admin/c/journey", label: "Learning journey", icon: Map },
      { href: "/admin/settings/site", label: "Site & contact", icon: Settings2 },
    ],
  },
  {
    group: "Work",
    items: [
      { href: "/admin/c/stack", label: "Tech stack", icon: Cpu },
      { href: "/admin/c/aitools", label: "AI tools", icon: Bot },
      { href: "/admin/c/services", label: "Services", icon: Wrench },
      { href: "/admin/c/reasons", label: "Why choose me", icon: ShieldCheck },
      { href: "/admin/c/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/c/blogs", label: "Blog", icon: BookOpen },
      { href: "/admin/c/reviews", label: "Client feedback", icon: MessageSquareQuote },
      { href: "/admin/c/faqs", label: "FAQ", icon: HelpCircle },
      { href: "/admin/c/resumes", label: "Resume", icon: FileText },
    ],
  },
  { group: "Inbox", items: [{ href: "/admin/c/messages", label: "Messages", icon: Inbox }] },
];

export default function AdminShell({ session, daysLeft, children }: { session: Session; daysLeft?: number | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the drawer after navigation
  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4" aria-label="Admin">
      <Link href="/admin" className="group flex items-center gap-2.5 px-2">
        <LogoMark className="h-9 w-9" />
        <span className="leading-tight">
          <span className="block text-sm font-semibold">Portfolio CMS</span>
          <span className="block text-[11px] text-muted">johir · admin</span>
        </span>
      </Link>
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive(it.href) ? "bg-fg font-medium text-bg" : "text-soft hover:bg-elev hover:text-fg"}`}
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto space-y-0.5 border-t pt-4">
        <Link href="/admin/account" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive("/admin/account") ? "bg-fg text-bg" : "text-soft hover:bg-elev"}`}>
          <KeyRound className="h-4 w-4" /> Account & password
        </Link>
        {session.role === "superadmin" && (
          <Link href="/admin/admins" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive("/admin/admins") ? "bg-fg text-bg" : "text-soft hover:bg-elev"}`}>
            <ShieldCheck className="h-4 w-4" /> Admins
          </Link>
        )}
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-soft hover:bg-red-500/10 hover:text-red-500">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r bg-card/50 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r bg-card shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full border" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-bg/80 px-4 py-3 backdrop-blur sm:px-8">
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Welcome back, {session.name.split(" ")[0]}</p>
            {daysLeft != null && <p className="text-[11px] text-muted">Session valid for {daysLeft} more day{daysLeft === 1 ? "" : "s"} · {session.role}</p>}
          </div>
          <ThemeToggle />
          <a href="/" target="_blank" rel="noopener" className="btn-ghost !px-3 !py-2">
            <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">View site</span>
          </a>
        </header>
        <div className="px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
