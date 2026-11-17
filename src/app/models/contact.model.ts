import  { Schema, model, models } from "mongoose";
import { IContact } from "../types/contact.interface";

const ContactSchema = new Schema<IContact>(
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
    phone: {
      type: String,
      trim: true,
    },
    service: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0,
    },
    message: {
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

// Index for fast IP lookup and date/email/phone filtering
ContactSchema.index({ ip: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ phone: 1 });
ContactSchema.index({ createdAt: -1 });

// Next.js hot-reload safe: reuse model if already compiled
export const ContactModel =
  models.Contact || model<IContact>("Contact", ContactSchema);
