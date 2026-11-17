/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from "../lib/db";
import { ContactModel } from "../models/contact.model";
import { IContact } from "../types/contact.interface";


const RATE_LIMIT_MINUTES = 60;

// ── IP Rate-limit check ────────────────────────────────────────────────────
export async function checkIpRateLimit(
  ip: string,
): Promise<{ blocked: boolean; retryAfterMinutes?: number }> {
  await connectDB();
  const windowStart = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);

  const recent = await ContactModel.findOne({
    ip,
    createdAt: { $gte: windowStart },
  }).sort({ createdAt: -1 });

  if (!recent) return { blocked: false };

  const submittedAt = (recent as any).createdAt as Date;
  const unlockAt = new Date(
    submittedAt.getTime() + RATE_LIMIT_MINUTES * 60 * 1000,
  );
  const remainingMs = unlockAt.getTime() - Date.now();
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return { blocked: true, retryAfterMinutes: Math.max(remainingMinutes, 1) };
}

// ── Create ─────────────────────────────────────────────────────────────────
export async function createContact(payload: IContact) {
  await connectDB();
  const created = await ContactModel.create(payload);
  return created.toObject();
}

// ── Get All (with filter + pagination) ────────────────────────────────────
export async function getAllContacts(query: {
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();
  const { email, phone, startDate, endDate, page = 1, limit = 20 } = query;
  const filter: Record<string, any> = {};

  if (email) filter.email = { $regex: email.trim(), $options: "i" };
  if (phone) filter.phone = { $regex: phone.trim(), $options: "i" };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    ContactModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContactModel.countDocuments(filter),
  ]);

  return {
    data: docs,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

// ── Get One ────────────────────────────────────────────────────────────────
export async function getContact(id: string) {
  await connectDB();
  const doc = await ContactModel.findById(id);
  return doc ? doc.toObject() : null;
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteContact(id: string) {
  await connectDB();
  const removed = await ContactModel.findByIdAndDelete(id);
  return removed ? removed.toObject() : null;
}
