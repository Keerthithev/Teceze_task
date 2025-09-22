import mongoose from 'mongoose';

const termsSchema = new mongoose.Schema(
  {
    service_management_fee_pct: { type: Number, default: 5 },
    travel_charge_per_km: { type: Number, default: 0.4 },
    travel_threshold_km: { type: Number, default: 50 },
    out_of_hours_multiplier: { type: Number, default: 1.5 },
    weekend_holiday_multiplier: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const TermsConditions = mongoose.model('TermsConditions', termsSchema);


