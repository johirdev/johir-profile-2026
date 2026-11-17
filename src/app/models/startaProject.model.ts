import { Schema, model, models } from "mongoose";
import { IStartProject } from "../types/startaProject.interface";


const StartProjectSchema = new Schema<IStartProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    companyOrDomain: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      trim: true,
    },
    startDate: {
      type: String,
      trim: true,
    },
    endDate: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Index for fast IP lookup and filtering
StartProjectSchema.index({ ip: 1, createdAt: -1 });
StartProjectSchema.index({ email: 1 });
StartProjectSchema.index({ country: 1 });
StartProjectSchema.index({ createdAt: -1 });

export const StartProjectModel =
  models.StartProject ||
  model<IStartProject>("StartProject", StartProjectSchema);
