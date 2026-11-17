/**
 * One declarative schema drives three things:
 *   1. the zod validator every admin write passes through (server),
 *   2. the generated admin form (client),
 *   3. the public types the site renders.
 *
 * Adding a field to a section = adding one line here.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "file"
  | "color"
  | "tags"
  | "lines"
  | "icon"
  | "icons"
  | "list";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  min?: number;
  options?: readonly string[];
  help?: string;
  placeholder?: string;
  /** Sub-fields for `list` */
  fields?: Field[];
  /** Layout hint for the admin grid */
  half?: boolean;
}

export interface CollectionDef {
  key: string;
  label: string;
  singular: string;
  description: string;
  /** Field shown as the row title in admin lists */
  titleField: string;
  subtitleField?: string;
  /** Boolean field that hides a row from the public site */
  publishField?: string;
  /** Text field turned into a URL slug */
  slugFrom?: string;
  fields: Field[];
  /** Visitors may create rows (contact/feedback) — admins only read/edit */
  publicCreate?: boolean;
  group: "Profile" | "Work" | "Content" | "Inbox";
}

export interface SettingDef {
  key: string;
  label: string;
  description: string;
  fields: Field[];
}

const order: Field = {
  name: "order",
  label: "Sort order",
  type: "number",
  help: "Lower numbers appear first",
  half: true,
};

/* ─────────────────────────── Collections ─────────────────────────── */

export const COLLECTIONS = {
  experiences: {
    key: "experiences",
    label: "Experience",
    singular: "Experience",
    group: "Profile",
    description: "Jobs shown on the right side of the About section.",
    titleField: "company",
    subtitleField: "role",
    fields: [
      { name: "company", label: "Company", type: "text", required: true, max: 120, half: true },
      { name: "role", label: "Role", type: "text", required: true, max: 120, half: true },
      { name: "logo", label: "Company logo", type: "image" },
      { name: "url", label: "Company website", type: "url", half: true },
      { name: "location", label: "Location", type: "text", max: 80, half: true },
      { name: "workType", label: "Work type", type: "select", options: ["Onsite", "Remote", "Hybrid", "Freelance"], half: true },
      { name: "period", label: "Period", type: "text", max: 60, placeholder: "Oct 2024 – Mar 2026", half: true },
      { name: "current", label: "Currently working here", type: "boolean", half: true },
      order,
      { name: "summary", label: "Summary", type: "textarea", max: 600 },
      { name: "highlights", label: "Highlights", type: "lines", help: "One achievement per line" },
      { name: "stack", label: "Stack used", type: "icons" },
      {
        name: "links",
        label: "Shipped products",
        type: "list",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 80, half: true },
          { name: "url", label: "URL", type: "url", half: true },
        ],
      },
    ],
  },
  education: {
    key: "education",
    label: "Education",
    singular: "Education",
    group: "Profile",
    description: "Formal education shown inside the About section.",
    titleField: "degree",
    subtitleField: "institution",
    fields: [
      { name: "degree", label: "Degree", type: "text", required: true, max: 120, half: true },
      { name: "institution", label: "Institution", type: "text", required: true, max: 160, half: true },
      { name: "subject", label: "Subject", type: "text", max: 120, half: true },
      { name: "period", label: "Period", type: "text", max: 40, half: true },
      { name: "result", label: "Result", type: "text", max: 40, half: true },
      { name: "status", label: "Status", type: "select", options: ["Completed", "In progress"], half: true },
      order,
    ],
  },
  journey: {
    key: "journey",
    label: "Learning journey",
    singular: "Milestone",
    group: "Profile",
    description: "How I learned my stack — the left column of About.",
    titleField: "title",
    subtitleField: "year",
    fields: [
      { name: "year", label: "Year / phase", type: "text", required: true, max: 30, half: true },
      { name: "title", label: "Title", type: "text", required: true, max: 120, half: true },
      { name: "description", label: "What I learned", type: "textarea", max: 500 },
      { name: "icons", label: "Technologies", type: "icons" },
      order,
    ],
  },
  stack: {
    key: "stack",
    label: "Tech stack",
    singular: "Stack group",
    group: "Work",
    description: "Stage 1 of the pipeline — technology groups.",
    titleField: "name",
    fields: [
      { name: "name", label: "Group name", type: "text", required: true, max: 60, half: true },
      { name: "icon", label: "Group icon", type: "icon", half: true },
      {
        name: "items",
        label: "Technologies",
        type: "list",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 40, half: true },
          { name: "icon", label: "Icon", type: "icon", half: true },
        ],
      },
      order,
    ],
  },
  aitools: {
    key: "aitools",
    label: "AI tools",
    singular: "AI tool",
    group: "Work",
    description: "Stage 2 of the pipeline — the AI I engineer with.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 40, half: true },
      { name: "icon", label: "Icon", type: "icon", half: true },
      { name: "use", label: "How I use it", type: "text", max: 140 },
      order,
    ],
  },
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    group: "Work",
    description: "Stage 3 of the pipeline — what I deliver.",
    titleField: "title",
    publishField: "published",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 80, half: true },
      { name: "icon", label: "Icon", type: "icon", half: true },
      { name: "description", label: "Description", type: "textarea", max: 400 },
      { name: "deliverables", label: "Deliverables", type: "lines" },
      { name: "stack", label: "Stack", type: "icons" },
      { name: "published", label: "Visible", type: "boolean", half: true },
      order,
    ],
  },
  reasons: {
    key: "reasons",
    label: "Why choose me",
    singular: "Reason",
    group: "Work",
    description: "Cards in the three-column Why Choose Me section.",
    titleField: "title",
    subtitleField: "stage",
    fields: [
      { name: "stage", label: "Column", type: "select", options: ["Foundation", "Process", "Outcome"], required: true, half: true },
      { name: "icon", label: "Icon", type: "icon", half: true },
      { name: "title", label: "Title", type: "text", required: true, max: 80 },
      { name: "description", label: "Description", type: "textarea", max: 400 },
      order,
    ],
  },
  projects: {
    key: "projects",
    label: "Projects",
    singular: "Project",
    group: "Work",
    description: "Case studies shown in Selected Work and /projects/[slug].",
    titleField: "title",
    subtitleField: "category",
    publishField: "published",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120, half: true },
      { name: "slug", label: "Slug", type: "text", max: 120, help: "Auto-generated when empty", half: true },
      { name: "category", label: "Category", type: "select", options: ["SaaS", "Web App", "E-commerce", "AI & Automation", "Dashboard", "Open Source", "Website"], required: true, half: true },
      { name: "status", label: "Status", type: "select", options: ["Live", "In development", "Case study", "Archived"], half: true },
      { name: "role", label: "My role", type: "text", max: 120, half: true },
      { name: "year", label: "Year", type: "text", max: 20, half: true },
      { name: "client", label: "Client / company", type: "text", max: 120, half: true },
      { name: "duration", label: "Duration", type: "text", max: 40, half: true },
      { name: "summary", label: "One-line summary", type: "textarea", required: true, max: 300 },
      { name: "cover", label: "Cover image", type: "image" },
      { name: "accent", label: "Accent colour", type: "color", half: true },
      { name: "featured", label: "Featured", type: "boolean", half: true },
      { name: "problem", label: "The problem", type: "textarea", max: 1500 },
      { name: "solution", label: "The solution", type: "textarea", max: 1500 },
      { name: "features", label: "Key features", type: "lines" },
      {
        name: "metrics",
        label: "Impact metrics",
        type: "list",
        fields: [
          { name: "value", label: "Value", type: "text", required: true, max: 20, half: true },
          { name: "label", label: "Label", type: "text", required: true, max: 60, half: true },
        ],
      },
      { name: "stack", label: "Tech stack", type: "icons" },
      { name: "liveUrl", label: "Live URL", type: "url", half: true },
      { name: "repoUrl", label: "Repository URL", type: "url", half: true },
      {
        name: "gallery",
        label: "Gallery",
        type: "list",
        fields: [
          { name: "image", label: "Image", type: "image", required: true },
          { name: "caption", label: "Caption", type: "text", max: 140 },
        ],
      },
      { name: "published", label: "Published", type: "boolean", half: true },
      order,
    ],
  },
  blogs: {
    key: "blogs",
    label: "Blog",
    singular: "Post",
    group: "Content",
    description: "Articles. Use ✨ Generate to draft one with AI from a subject.",
    titleField: "title",
    subtitleField: "subject",
    publishField: "published",
    slugFrom: "title",
    fields: [
      { name: "subject", label: "Subject", type: "text", required: true, max: 160, help: "What the post is about — the AI writer starts from this" },
      { name: "title", label: "Title", type: "text", required: true, max: 160, half: true },
      { name: "slug", label: "Slug", type: "text", max: 160, help: "Auto-generated when empty", half: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, max: 320 },
      { name: "cover", label: "Cover image", type: "image" },
      { name: "content", label: "Content", type: "markdown", required: true, max: 60000 },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "accent", label: "Accent colour", type: "color", half: true },
      { name: "featured", label: "Featured", type: "boolean", half: true },
      { name: "published", label: "Published", type: "boolean", half: true },
    ],
  },
  reviews: {
    key: "reviews",
    label: "Client feedback",
    singular: "Review",
    group: "Content",
    description: "Testimonials. Visitor submissions arrive hidden until you publish them.",
    titleField: "name",
    subtitleField: "company",
    publishField: "published",
    publicCreate: true,
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80, half: true },
      { name: "role", label: "Role", type: "text", max: 80, half: true },
      { name: "company", label: "Company", type: "text", max: 80, half: true },
      { name: "country", label: "Country", type: "text", max: 60, half: true },
      { name: "avatar", label: "Photo", type: "image" },
      { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, required: true, half: true },
      { name: "project", label: "Project", type: "text", max: 120, half: true },
      { name: "quote", label: "Feedback", type: "textarea", required: true, max: 900 },
      { name: "featured", label: "Featured", type: "boolean", half: true },
      { name: "published", label: "Published", type: "boolean", half: true },
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQ",
    singular: "Question",
    group: "Content",
    description: "Frequently asked questions.",
    titleField: "question",
    subtitleField: "category",
    publishField: "published",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, max: 200 },
      { name: "answer", label: "Answer", type: "textarea", required: true, max: 1500 },
      { name: "category", label: "Category", type: "select", options: ["General", "Hiring", "Process", "Pricing", "Technical"], half: true },
      { name: "published", label: "Visible", type: "boolean", half: true },
      order,
    ],
  },
  resumes: {
    key: "resumes",
    label: "Resume",
    singular: "Resume",
    group: "Content",
    description: "Upload, replace or delete CVs. The one marked active is public.",
    titleField: "title",
    subtitleField: "version",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120, half: true },
      { name: "version", label: "Version label", type: "text", max: 40, placeholder: "2026 · v3", half: true },
      { name: "file", label: "PDF file", type: "file", required: true },
      { name: "summary", label: "Summary", type: "textarea", max: 500 },
      { name: "highlights", label: "Highlights", type: "lines" },
      { name: "active", label: "Active (shown publicly)", type: "boolean", help: "Activating one deactivates the others" },
    ],
  },
  messages: {
    key: "messages",
    label: "Messages",
    singular: "Message",
    group: "Inbox",
    description: "What visitors sent through the contact form.",
    titleField: "name",
    subtitleField: "subject",
    publicCreate: true,
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80, half: true },
      { name: "email", label: "Email", type: "text", required: true, max: 160, half: true },
      { name: "subject", label: "Subject", type: "select", options: ["Full-time role", "Freelance project", "Consulting", "Collaboration", "Just saying hi"], half: true },
      { name: "budget", label: "Budget", type: "select", options: ["Not sure yet", "< $1k", "$1k – $5k", "$5k – $15k", "$15k+"], half: true },
      { name: "message", label: "Message", type: "textarea", required: true, max: 3000 },
      { name: "status", label: "Status", type: "select", options: ["New", "Read", "Replied", "Archived"], half: true },
    ],
  },
} satisfies Record<string, CollectionDef>;

export type CollectionKey = keyof typeof COLLECTIONS;
export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];

export const isCollectionKey = (k: string): k is CollectionKey =>
  Object.prototype.hasOwnProperty.call(COLLECTIONS, k);

/* ─────────────────────────── Singletons ─────────────────────────── */

export const SETTINGS = {
  site: {
    key: "site",
    label: "Site & contact",
    description: "Name, contact details, availability and social links.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, max: 80, half: true },
      { name: "shortName", label: "Short name", type: "text", max: 40, half: true },
      { name: "role", label: "Headline role", type: "text", max: 80, half: true },
      { name: "location", label: "Location", type: "text", max: 80, half: true },
      { name: "email", label: "Email", type: "text", max: 160, half: true },
      { name: "phone", label: "Phone", type: "text", max: 40, half: true },
      { name: "whatsapp", label: "WhatsApp link", type: "url", half: true },
      { name: "timezone", label: "Timezone", type: "text", max: 40, half: true },
      { name: "available", label: "Available for work", type: "boolean", half: true },
      { name: "availabilityText", label: "Availability text", type: "text", max: 80, half: true },
      {
        name: "socials",
        label: "Social links",
        type: "list",
        fields: [
          { name: "platform", label: "Platform", type: "select", options: ["GitHub", "LinkedIn", "X", "Facebook", "YouTube", "Dribbble", "Medium", "Dev.to", "Stack Overflow"], required: true, half: true },
          { name: "url", label: "URL", type: "url", required: true, half: true },
        ],
      },
    ],
  },
  hero: {
    key: "hero",
    label: "Hero banner",
    description: "The opening banner. Each role swaps the image, icons and copy with an animation.",
    fields: [
      { name: "greeting", label: "Greeting", type: "text", max: 60, half: true },
      { name: "rotateSeconds", label: "Seconds per role", type: "number", min: 3, max: 30, half: true },
      { name: "headline", label: "Headline (before the rotating role)", type: "text", max: 80 },
      { name: "bio", label: "Intro paragraph", type: "textarea", max: 500 },
      { name: "primaryLabel", label: "Primary button", type: "text", max: 30, half: true },
      { name: "primaryHref", label: "Primary link", type: "text", max: 200, half: true },
      {
        name: "stats",
        label: "Stats",
        type: "list",
        fields: [
          { name: "value", label: "Value", type: "text", required: true, max: 12, half: true },
          { name: "label", label: "Label", type: "text", required: true, max: 40, half: true },
        ],
      },
      {
        name: "roles",
        label: "Rotating roles",
        type: "list",
        fields: [
          { name: "title", label: "Role", type: "text", required: true, max: 60, half: true },
          { name: "accent", label: "Accent colour", type: "color", half: true },
          { name: "tagline", label: "Tagline", type: "text", max: 120 },
          { name: "description", label: "Description", type: "textarea", max: 400 },
          { name: "image", label: "Right-side image", type: "image" },
          { name: "icons", label: "Orbiting icons", type: "icons" },
          { name: "codeTitle", label: "Code card title", type: "text", max: 60, half: true },
          { name: "code", label: "Code card", type: "textarea", max: 600, help: "A short snippet shown on the floating card" },
        ],
      },
    ],
  },
  about: {
    key: "about",
    label: "About me",
    description: "Intro copy and facts for the About section.",
    fields: [
      { name: "heading", label: "Heading", type: "text", max: 140 },
      { name: "bio", label: "Bio", type: "textarea", max: 2000, help: "Blank line = new paragraph" },
      { name: "portrait", label: "Portrait", type: "image" },
      {
        name: "facts",
        label: "Quick facts",
        type: "list",
        fields: [
          { name: "label", label: "Label", type: "text", required: true, max: 40, half: true },
          { name: "value", label: "Value", type: "text", required: true, max: 80, half: true },
        ],
      },
      { name: "principles", label: "How I learn (principles)", type: "lines" },
    ],
  },
} satisfies Record<string, SettingDef>;

export type SettingKey = keyof typeof SETTINGS;
export const isSettingKey = (k: string): k is SettingKey =>
  Object.prototype.hasOwnProperty.call(SETTINGS, k);

/* ─────────────────────────── Public types ─────────────────────────── */

export interface Doc {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  order?: number;
  [key: string]: unknown;
}

export interface LinkItem { name: string; url?: string }
export interface StackItem { name: string; icon?: string }
export interface Metric { value: string; label: string }

export interface Experience extends Doc {
  company: string; role: string; logo?: string; url?: string; location?: string;
  workType?: string; period?: string; current?: boolean; summary?: string;
  highlights?: string[]; stack?: string[]; links?: LinkItem[];
}
export interface Education extends Doc {
  degree: string; institution: string; subject?: string; period?: string; result?: string; status?: string;
}
export interface Milestone extends Doc { year: string; title: string; description?: string; icons?: string[] }
export interface StackGroup extends Doc { name: string; icon?: string; items?: StackItem[] }
export interface AiTool extends Doc { name: string; icon?: string; use?: string }
export interface Service extends Doc {
  title: string; icon?: string; description?: string; deliverables?: string[]; stack?: string[];
}
export interface Reason extends Doc { stage: "Foundation" | "Process" | "Outcome"; icon?: string; title: string; description?: string }
export interface Project extends Doc {
  title: string; slug: string; category: string; status?: string; role?: string; year?: string;
  client?: string; duration?: string; summary: string; cover?: string; accent?: string; featured?: boolean;
  problem?: string; solution?: string; features?: string[]; metrics?: Metric[]; stack?: string[];
  liveUrl?: string; repoUrl?: string; gallery?: { image: string; caption?: string }[];
}
export interface BlogPost extends Doc {
  subject: string; title: string; slug: string; excerpt: string; cover?: string; content: string;
  tags?: string[]; accent?: string; featured?: boolean; readMinutes?: number;
}
export interface Review extends Doc {
  name: string; role?: string; company?: string; country?: string; avatar?: string;
  rating: number; project?: string; quote: string; featured?: boolean;
}
export interface Faq extends Doc { question: string; answer: string; category?: string }
export interface Resume extends Doc {
  title: string; version?: string; file: string; summary?: string; highlights?: string[]; active?: boolean;
}

export interface SiteSettings {
  name: string; shortName?: string; role?: string; location?: string; email?: string; phone?: string;
  whatsapp?: string; timezone?: string; available?: boolean; availabilityText?: string;
  socials?: { platform: string; url: string }[];
}
export interface HeroRole {
  title: string; accent?: string; tagline?: string; description?: string; image?: string;
  icons?: string[]; codeTitle?: string; code?: string;
}
export interface HeroSettings {
  greeting?: string; rotateSeconds?: number; headline?: string; bio?: string;
  primaryLabel?: string; primaryHref?: string; stats?: Metric[]; roles?: HeroRole[];
}
export interface AboutSettings {
  heading?: string; bio?: string; portrait?: string;
  facts?: { label: string; value: string }[]; principles?: string[];
}
export interface SettingsMap { site: SiteSettings; hero: HeroSettings; about: AboutSettings }
