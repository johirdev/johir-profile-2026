import { Model } from "mongoose";

export type IReview = {
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image: string;
  rating: number;
  review_text: string;
  badge_label?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ReviewModel = Model<IReview, Record<string, unknown>>;
