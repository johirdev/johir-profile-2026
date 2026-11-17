import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  AiTool, BlogPost, Education, Experience, Faq as FaqItem, Milestone, Project, Resume, Review, Service, StackGroup, Reason,
} from "@/content/schema";
import About from "@/components/site/About";
import BlogCard from "@/components/site/BlogCard";
import Contact from "@/components/site/Contact";
import Faq from "@/components/site/Faq";
import Hero from "@/components/site/Hero";
import Projects from "@/components/site/Projects";
import ResumeSection from "@/components/site/ResumeSection";
import Reviews from "@/components/site/Reviews";
import StackPipeline from "@/components/site/StackPipeline";
import WhyChooseMe from "@/components/site/WhyChooseMe";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSetting, listPublic } from "@/server/repo";

// Static, refreshed every 5 minutes and instantly whenever the admin saves.
export const revalidate = 300;

export default async function HomePage() {
  const [site, hero, about, experiences, education, journey, stack, tools, services, reasons, projects, resumes, reviews, blogs, faqs] =
    await Promise.all([
      getSetting("site"),
      getSetting("hero"),
      getSetting("about"),
      listPublic<Experience>("experiences"),
      listPublic<Education>("education"),
      listPublic<Milestone>("journey"),
      listPublic<StackGroup>("stack"),
      listPublic<AiTool>("aitools"),
      listPublic<Service>("services"),
      listPublic<Reason>("reasons"),
      listPublic<Project>("projects"),
      listPublic<Resume>("resumes"),
      listPublic<Review>("reviews", 40),
      listPublic<BlogPost>("blogs", 20),
      listPublic<FaqItem>("faqs"),
    ]);

  const resume = resumes.find((r) => r.active) ?? resumes[0];
  const latest = [...blogs].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);

  return (
    <>
      <Hero hero={hero} site={site} resumeUrl={resume?.file} />
      <About about={about} experiences={experiences} education={education} journey={journey} />
      <StackPipeline stack={stack} tools={tools} services={services} />
      <WhyChooseMe reasons={reasons} stack={stack} tools={tools} services={services} stats={hero.stats} />

      <section id="work" className="py-12 sm:py-16">
        <div className="shell">
          <SectionHeading
            index="04"
            eyebrow="Selected work"
            title="Products I've designed,"
            accent="built and shipped."
            intro="Real products for real users — each with the problem, the approach and the stack behind it."
          />
          <Projects projects={projects} />
        </div>
      </section>

      <ResumeSection resume={resume} experiences={experiences} />

      <section id="feedback" className="py-12 sm:py-16">
        <div className="shell">
          <SectionHeading index="06" eyebrow="Client feedback" title="What people say" accent="after we ship." />
          <Reviews reviews={reviews} />
        </div>
      </section>

      {latest.length > 0 && (
        <section id="blog" className="py-12 sm:py-16">
          <div className="shell">
            <SectionHeading
              index="07"
              eyebrow="Writing"
              title="Notes from the"
              accent="engineering desk."
              intro="What I learn about AI, Next.js, Go and automation — written down so others can skip the hard parts."
            />
            <div className="grid gap-5 lg:grid-cols-3">
              <Reveal className="lg:col-span-3">
                <BlogCard post={latest[0]} large />
              </Reveal>
              {latest.slice(1).map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08}>
                  <BlogCard post={p} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/blog" className="btn-ghost">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="py-12 sm:py-16">
          <div className="shell">
            <SectionHeading index="08" eyebrow="FAQ" title="Questions," accent="answered." />
            <Faq faqs={faqs} />
          </div>
        </section>
      )}

      <section id="contact" className="py-12 sm:py-16">
        <div className="shell">
          <SectionHeading index="09" eyebrow="Contact" title="Let's build" accent="something great." />
          <Contact site={site} />
        </div>
      </section>
    </>
  );
}
