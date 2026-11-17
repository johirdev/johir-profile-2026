// blog.model.ts
import { Schema, model, models, Model } from "mongoose";
import { IBlog } from "../types/blog.interface";

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    cover_image: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author_name: { type: String, trim: true, default: "" },
    author_image: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
    read_time: { type: String, trim: true, default: "" },
    slug: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true },
);

// ✅ Next.js hot-reload safe — prevents "Cannot overwrite model" error
export const BlogModel: Model<IBlog> =
  models.Blog || model<IBlog>("Blog", BlogSchema);
