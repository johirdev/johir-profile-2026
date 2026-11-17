import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-bg relative grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-accent-ink">error 404</p>
        <h1 className="mt-3 text-[clamp(5rem,20vw,12rem)] font-bold leading-none tracking-tighter">404</h1>
        <p className="mt-4 text-lg text-soft">This page wandered off. Let&apos;s get you back.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Back home</Link>
          <Link href="/blog" className="btn-ghost">Read the blog</Link>
        </div>
      </div>
    </main>
  );
}
