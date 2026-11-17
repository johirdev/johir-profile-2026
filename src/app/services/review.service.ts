import { ApiError } from "../lib/apiError";
import { ReviewModel } from "../models/review.model";
import { IReview } from "../types/review.interface";


const parseRating = (val: unknown): number => {
  const n = Number(val);
  if (isNaN(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
};

// ── CREATE ────────────────────────────────────────────────────────────────
export const createReviewService = async (body: Record<string, unknown>) => {
  const { reviewer_name, reviewer_role, reviewer_image, review_text } = body;

  if (!reviewer_name || !reviewer_role || !reviewer_image || !review_text)
    throw new ApiError(
      400,
      "reviewer_name, reviewer_role, reviewer_image and review_text are required",
    );

  const payload = {
    reviewer_name: String(reviewer_name).trim(),
    reviewer_role: String(reviewer_role).trim(),
    reviewer_image: String(reviewer_image).trim(),
    rating: parseRating(body.rating),
    review_text: String(review_text).trim(),
    badge_label: body.badge_label ? String(body.badge_label).trim() : "",
  };

  const created = await ReviewModel.create(payload);
  return created.toObject();
};

// ── UPDATE ────────────────────────────────────────────────────────────────
export const updateReviewService = async (
  id: string,
  body: Record<string, unknown>,
) => {
  const existing = await ReviewModel.findById(id);
  if (!existing) throw new ApiError(404, "Review not found");

  const payload: Partial<IReview> = {};
  if (body.reviewer_name !== undefined)
    payload.reviewer_name = String(body.reviewer_name).trim();
  if (body.reviewer_role !== undefined)
    payload.reviewer_role = String(body.reviewer_role).trim();
  if (body.reviewer_image !== undefined)
    payload.reviewer_image = String(body.reviewer_image).trim();
  if (body.rating !== undefined) payload.rating = parseRating(body.rating);
  if (body.review_text !== undefined)
    payload.review_text = String(body.review_text).trim();
  if (body.badge_label !== undefined)
    payload.badge_label = String(body.badge_label).trim();

  const updated = await ReviewModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new ApiError(404, "Review not found");
  return updated.toObject();
};

// ── DELETE ────────────────────────────────────────────────────────────────
export const deleteReviewService = async (id: string) => {
  const removed = await ReviewModel.findByIdAndDelete(id);
  if (!removed) throw new ApiError(404, "Review not found");
  return removed.toObject();
};

// ── GET ONE ───────────────────────────────────────────────────────────────
export const getReviewService = async (id: string) => {
  const doc = await ReviewModel.findById(id);
  if (!doc) throw new ApiError(404, "Review not found");
  return doc.toObject();
};

// ── GET ALL ───────────────────────────────────────────────────────────────
export const getAllReviewsService = async () => {
  return ReviewModel.find().sort({ createdAt: -1 }).lean();
};
