import { Model } from "mongoose";

export type IPrice = {
  price_heading: string;
  price_amount: number;
  active_mostpopular: boolean;
  contact: string;
  features: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type PriceModel = Model<IPrice, Record<string, unknown>>;
