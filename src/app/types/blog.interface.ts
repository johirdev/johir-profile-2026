// blog.interface.ts
import { Model } from "mongoose";

export type IBlog = {
  title: string;
  category: string;
  cover_image: string;
  excerpt: string;
  content: string;
  author_name?: string;
  author_image?: string;
  tags?: string[];
  read_time?: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BlogModelType = Model<IBlog, Record<string, unknown>>;
