import "server-only";
import mongoose, { Schema, type Model } from "mongoose";
import type { CollectionKey } from "@/content/schema";

const { models, model } = mongoose;

/* Content collections are validated by zod before they reach Mongo
   (see validation.ts), so the Mongoose layer stays schemaless. */
export function contentModel(key: CollectionKey): Model<Record<string, unknown>> {
  const name = `pf_${key}`;
  if (models[name]) return models[name] as Model<Record<string, unknown>>;
  const schema = new Schema<Record<string, unknown>>({}, { strict: false, timestamps: true, collection: name, minimize: false });
  schema.index({ order: 1, createdAt: -1 });
  if (key === "projects" || key === "blogs") schema.index({ slug: 1 }, { unique: true, sparse: true });
  if (key === "messages" || key === "reviews") schema.index({ ipHash: 1, createdAt: -1 });
  return model<Record<string, unknown>>(name, schema);
}

export interface SettingDoc { key: string; value: Record<string, unknown> }
export const SettingModel: Model<SettingDoc> =
  (models.pf_settings as Model<SettingDoc>) ||
  model<SettingDoc>(
    "pf_settings",
    new Schema<SettingDoc>(
      { key: { type: String, required: true, unique: true }, value: { type: Schema.Types.Mixed, default: {} } },
      { timestamps: true, collection: "pf_settings", minimize: false },
    ),
  );

export interface AdminDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "admin";
  tokenVersion: number;
  failedAttempts: number;
  lockUntil?: Date | null;
  lastLoginAt?: Date | null;
  createdAt?: Date;
}
export const AdminModel: Model<AdminDoc> =
  (models.pf_admins as Model<AdminDoc>) ||
  model<AdminDoc>(
    "pf_admins",
    new Schema<AdminDoc>(
      {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
        tokenVersion: { type: Number, default: 0 },
        failedAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
        lastLoginAt: { type: Date, default: null },
      },
      { timestamps: true, collection: "pf_admins" },
    ),
  );

export interface MediaDoc {
  data: Buffer;
  contentType: string;
  size: number;
  name: string;
  uploadedBy?: string;
}
export const MediaModel: Model<MediaDoc> =
  (models.pf_media as Model<MediaDoc>) ||
  model<MediaDoc>(
    "pf_media",
    new Schema<MediaDoc>(
      {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
        size: { type: Number, required: true },
        name: { type: String, default: "" },
        uploadedBy: { type: String },
      },
      { timestamps: true, collection: "pf_media" },
    ),
  );
