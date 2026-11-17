import { ToastContainer } from "react-toastify";

import Footer from "../Layout/Client/Footer/Footer";
import NavbarClient from "../Layout/Client/Navbar/Navbar";
import { homeGraph, jsonLd } from "@/lib/seo";

/**
 * The public site. <html>, <body>, the font variables and ThemeProvider all
 * live in the root layout (src/app/layout.tsx) — this layer only adds the
 * public chrome and the structured data.
 *
 * Deliberately no `metadata` export: the root already sets the defaults and
 * the `%s | Johirul Islam Rasel` template. Re-exporting the same object here
 * made the root template wrap the title a second time, so the home page
 * rendered "Johirul Islam Rasel — Full-Stack Software Engineer | Johirul
 * Islam Rasel".
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* One @graph, cross-referenced by @id, instead of loose schema blobs —
          this is what lets Google resolve the person, the site and the page
          into a single entity for a "Johirul Islam Rasel" query. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(homeGraph) }}
      />

      <NavbarClient />

      <main id="content" className="min-h-screen">
        {children}
      </main>

      <Footer />

      <ToastContainer
        position="bottom-right"
        theme="colored"
        toastStyle={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          borderRadius: "14px",
          border: "1px solid var(--accent-line)",
          boxShadow: "var(--shadow-3)",
        }}
      />
    </>
  );
}
