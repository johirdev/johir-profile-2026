// app/models/project.model.ts
import { Schema, model, models, Model } from "mongoose";

// ── Types ──────────────────────────────────────────────────────────────────
export type ProjectCategory =
  | "Web Apps"
  | "Mobile Apps"
  | "E-Commerce"
  | "SaaS"
  | "UI/UX Design"
  | "Digital Marketing"
  | "Video Editing";

export interface ITechStackItem {
  name: string;
  slug?: string;
}

export type IProject = {
  title: string;
  category: ProjectCategory;
  summary: string;
  problem_statement?: string;
  description?: string;
  client_name?: string;
  cover_image: string;
  image_2?: string;
  image_3?: string;
  tech_stack?: ITechStackItem[];
  live_url?: string;
  github_url?: string;
  tags?: string[];
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const CATEGORIES: ProjectCategory[] = [
  "Web Apps",
  "Mobile Apps",
  "E-Commerce",
  "SaaS",
  "UI/UX Design",
  "Digital Marketing",
  "Video Editing",
];

// ── Sub-schema ─────────────────────────────────────────────────────────────
const TechStackSchema = new Schema<ITechStackItem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
  },
  { _id: false },
);

// ── Schema ─────────────────────────────────────────────────────────────────
const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    summary: { type: String, required: true, trim: true },
    problem_statement: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    client_name: { type: String, trim: true, default: "" },
    cover_image: { type: String, required: true, trim: true },
    image_2: { type: String, trim: true, default: "" },
    image_3: { type: String, trim: true, default: "" },
    tech_stack: { type: [TechStackSchema], default: [] },
    live_url: { type: String, trim: true, default: "" },
    github_url: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Model (Next.js hot-reload safe) ───────────────────────────────────────
// `models.Project` check prevents "Cannot overwrite model once compiled" error
// that happens during Next.js dev hot reloads.
export const ProjectModel: Model<IProject> =
  models.Project || model<IProject>("Project", ProjectSchema);
