import BackToTop from "@/components/site/BackToTop";
import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import { homeGraph, jsonLd } from "@/lib/seo";
import { getSetting } from "@/server/repo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSetting("site");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeGraph) }} />
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Navbar name={site.name} available={site.available} />
      <main id="content">{children}</main>
      <Footer site={site} />
      <BackToTop />
    </>
  );
}
