// blog.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlogModel } from "../models/blog.model";
import { IBlog } from "../types/blog.interface";


const createService = async (payload: IBlog) => {
  const created = await BlogModel.create(payload as any);
  return created.toObject();
};

const updateService = async (id: string, payload: Partial<IBlog>) => {
  const existing = await BlogModel.findById(id);
  if (!existing) return null;

  const updated = await BlogModel.findByIdAndUpdate(id, payload as any, {
    new: true,
    runValidators: true,
  });

  return updated ? updated.toObject() : null;
};

const deleteService = async (id: string) => {
  const removed = await BlogModel.findByIdAndDelete(id);
  if (!removed) return null;
  return removed.toObject();
};

const getService = async (id: string) => {
  const doc = await BlogModel.findById(id);
  return doc ? doc.toObject() : null;
};

const getAllService = async () => {
  const docs = await BlogModel.find().sort({ createdAt: -1 }).lean();
  return docs;
};

export const BlogServices = {
  createService,
  updateService,
  deleteService,
  getService,
  getAllService,
};
