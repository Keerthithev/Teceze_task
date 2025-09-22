import mongoose from 'mongoose';

const priceBookSchema = new mongoose.Schema(
  {
    region: { type: String, index: true, required: true },
    country: { type: String, index: true, required: true },
    supplier: { type: String, default: 'Direct' },
    currency: { type: String },
    payment_terms: { type: String },
    level: { type: String, enum: ['L1','L2','L3','L4','L5'], required: true },
    service_type: { type: String, required: true },
    base_rate: { type: Number, required: true },
    backfill_rate: { type: Number },
    experience_note: { type: String },
    incident_rates: {
      SBD: { type: Number },
      NBD: { type: Number },
      '2BD': { type: Number },
      '3BD': { type: Number },
      '4BD': { type: Number },
      '9x5x4': { type: Number },
      '24x7x4': { type: Number },
      AdditionalHour: { type: Number },
    },
    additional_hour_rate: { type: Number },
  },
  { timestamps: true }
);

priceBookSchema.index({ region: 1, country: 1, level: 1, service_type: 1 });

export const PriceBook = mongoose.model('PriceBook', priceBookSchema);


