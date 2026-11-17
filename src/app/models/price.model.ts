import { Schema, model, models } from "mongoose";
import { IPrice } from "../types/price.interface";

const PriceSchema = new Schema<IPrice>(
  {
    price_heading: { type: String, required: true, trim: true },
    price_amount: { type: Number, required: true, min: 0 },
    active_mostpopular: { type: Boolean, default: false },
    contact: { type: String, required: true, trim: true },
    features: { type: [String], default: [] },
  },
  { timestamps: true },
);

// "models.prices ||" — hot reload এ duplicate model error এড়ায়
export const PriceModel = models.prices || model<IPrice>("prices", PriceSchema);
