import { Schema, model, models } from "mongoose";
import { IReview } from "../types/review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    reviewer_name: { type: String, required: true, trim: true },
    reviewer_role: { type: String, required: true, trim: true },
    reviewer_image: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, required: true, trim: true },
    badge_label: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const ReviewModel =
  models.Review || model<IReview>("Review", ReviewSchema);
