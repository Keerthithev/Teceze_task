import mongoose from 'mongoose';

const keyValueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const priceSchema = new mongoose.Schema(
  {
    region: { type: String, index: true },
    country: { type: String, index: true },
    supplier: { type: String },
    currency: { type: String },
    paymentTerms: { type: String },
    // Store all other numeric/text columns as a flexible map
    data: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

priceSchema.index({ region: 1, country: 1, supplier: 1 }, { unique: false });

export const Price = mongoose.model('Price', priceSchema);


