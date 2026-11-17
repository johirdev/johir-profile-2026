import { Model } from "mongoose";

export type IStartProject = {
  name: string;
  email: string;
  contact?: string;
  whatsapp?: string;
  companyOrDomain?: string;
  country?: string;
  category?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  details?: string;
  ip: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StartProjectModel = Model<IStartProject, Record<string, unknown>>;
