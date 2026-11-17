import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

/** Shared frame for the login / register screens. */
export default function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="noise relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" aria-label="Home" className="group mx-auto mb-6 block w-fit"><LogoMark className="h-12 w-12" /></Link>
        <div className="panel p-6 shadow-2xl sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-soft">{footer}</div>}
      </div>
    </main>
  );
}
