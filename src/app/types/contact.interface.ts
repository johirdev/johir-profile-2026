import { Model } from "mongoose";

export type IContact = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: number;
  message?: string;
  ip: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ContactModel = Model<IContact, Record<string, unknown>>;
