"use client";

import { useState } from "react";
import "./techStack.css";

/**
 * The stack shown here is the one claimed everywhere else on the site — the
 * hero ticker, the About skill bars and the Person JSON-LD `knowsAbout` list.
 * Anything not actually in that profile was dropped rather than padded out.
 */
interface Tech {
  name: string;
  slug: string;
  /** Brand hex without the leading #. Omit for marks whose brand colour is black. */
  color?: string;
}

const icon = (tech: Tech) =>
  `https://cdn.simpleicons.org/${tech.slug}/${tech.color ?? "000000"}`;

/** Languages, frameworks and the UI layer. */
const CORE: Tech[] = [
  { name: "TypeScript", slug: "typescript", color: "3178C6" },
  { name: "JavaScript", slug: "javascript", color: "F7DF1E" },
  { name: "React.js", slug: "react", color: "61DAFB" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Node.js", slug: "nodedotjs", color: "5FA04E" },
  { name: "Express.js", slug: "express" },
  { name: "Go (Golang)", slug: "go", color: "00ADD8" },
  { name: "Laravel", slug: "laravel", color: "FF2D20" },
  { name: "Tailwind CSS", slug: "tailwindcss", color: "06B6D4" },
  { name: "Redux Toolkit", slug: "redux", color: "764ABC" },
  { name: "React Query", slug: "reactquery", color: "FF4154" },
  { name: "Framer Motion", slug: "framer", color: "0055FF" },
  { name: "Socket.io", slug: "socketdotio" },
  { name: "i18next", slug: "i18next", color: "26A69A" },
];

/** Data, infrastructure and day-to-day tooling. */
const PLATFORM: Tech[] = [
  { name: "MongoDB", slug: "mongodb", color: "47A248" },
  { name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
  { name: "MySQL", slug: "mysql", color: "4479A1" },
  { name: "Redis", slug: "redis", color: "FF4438" },
  { name: "Prisma", slug: "prisma" },
  { name: "Firebase", slug: "firebase", color: "FFCA28" },
  { name: "Docker", slug: "docker", color: "2496ED" },
  { name: "Nginx", slug: "nginx", color: "009639" },
  { name: "GitHub Actions", slug: "githubactions", color: "2088FF" },
  { name: "Vercel", slug: "vercel" },
  { name: "Cloudflare", slug: "cloudflare", color: "F38020" },
  { name: "DigitalOcean", slug: "digitalocean", color: "0080FF" },
  { name: "Linux", slug: "linux", color: "FCC624" },
  { name: "Git", slug: "git", color: "F05032" },
  { name: "Postman", slug: "postman", color: "FF6C37" },
  { name: "Figma", slug: "figma", color: "F24E1E" },
];

function TechCard({ tech }: { tech: Tech }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="stack__item">
      <div className="stack__card" title={tech.name}>
        {failed ? (
          <span aria-hidden="true" className="stack__fallback">
            {tech.name.charAt(0)}
          </span>
        ) : (
          // Remote SVG from a CDN: next/image cannot optimise SVG and would
          // only add a proxy hop, so a plain <img> is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon(tech)}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`stack__icon${tech.color ? "" : " stack__icon--mono"}`}
          />
        )}
        <span className="stack__name">{tech.name}</span>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  label,
  duration,
}: {
  items: Tech[];
  reverse?: boolean;
  label: string;
  duration: number;
}) {
  return (
    <div>
      <div className="stack__row-label">
        <span>{label}</span>
      </div>

      <div className="stack__viewport">
        <div
          className={`stack__track${reverse ? " stack__track--reverse" : ""}`}
          style={{ ["--duration" as string]: `${duration}s` }}
        >
          {/* Rendered twice: the CSS animation translates by exactly -50%,
              so the second copy is already in place when the loop restarts.
              aria-hidden on the duplicate keeps it out of the a11y tree. */}
          {items.map((tech) => (
            <TechCard key={`a-${tech.slug}`} tech={tech} />
          ))}
          <div className="contents" aria-hidden="true">
            {items.map((tech) => (
              <TechCard key={`b-${tech.slug}`} tech={tech} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TechStackSlider() {
  return (
    <section className="stack" id="stack" aria-labelledby="stack-title">
      <div className="stack__head">
        <span className="stack__eyebrow">
          <span className="stack__eyebrow-dot" aria-hidden="true" />
          Tech Stack
        </span>

        <h2 id="stack-title" className="stack__title">
          The tools I actually{" "}
          <span className="stack__title-accent">ship production with</span>
        </h2>

        <p className="stack__lede">
          Four years of building and maintaining real systems — every item
          below is something I have taken from first commit to production.
        </p>
      </div>

      <div className="stack__rows">
        <MarqueeRow
          items={CORE}
          label="Languages & Frameworks"
          duration={52}
        />
        <MarqueeRow
          items={PLATFORM}
          label="Data, Infrastructure & Tooling"
          reverse
          duration={58}
        />
      </div>

      <p className="stack__note">
        Most comfortable in <strong>TypeScript</strong>,{" "}
        <strong>Next.js</strong> and <strong>Node.js</strong> — currently going
        deeper on <strong>Go</strong> and platform engineering.
      </p>
    </section>
  );
}
