import { Schema, model, models } from "mongoose";
import { IAdmin } from "../types/admin.interface";

const BlockedIPSchema = new Schema(
  {
    ip: { type: String, required: true },
    expires: { type: Number, required: true },
  },
  { _id: false },
);

const AdminSchema = new Schema<IAdmin>(
  {
    admin_role: {
      type: String,
      required: true,
      enum: ["superadmin", "admin", "viewOnly"],
      default: "admin",
    },
    admin_name: { type: String, required: true, trim: true },
    admin_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    admin_phone: { type: String, required: true, unique: true, trim: true },
    admin_password: { type: String, required: true, select: false },
    admin_ip_address: { type: String, default: "0.0.0.0" },
    login_attempts: { type: Number, default: 0 },
    last_attempt: { type: Date, default: null },
    blockTime: { type: Date, default: null },
    blockedIPs: { type: [BlockedIPSchema], default: [] },
  },
  { timestamps: true },
);

export const AdminModel = models.admins || model<IAdmin>("admins", AdminSchema);
