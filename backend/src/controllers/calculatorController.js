import { PriceBook } from '../models/PriceBook.js';
import { TermsConditions } from '../models/TermsConditions.js';

export async function getRegions(req, res) {
  const regions = await PriceBook.distinct('region');
  res.json(regions.sort());
}

export async function getCountries(req, res) {
  const { region } = req.query;
  if (!region) return res.status(400).json({ message: 'region is required' });
  const countries = await PriceBook.distinct('country', { region });
  res.json(countries.sort());
}

export async function calculateQuote(req, res) {
  const { country, level, service_type, distance = 0, out_of_hours = false, weekend = false } = req.body || {};
  if (!country || !level || !service_type) {
    return res.status(400).json({ message: 'country, level, service_type are required' });
  }

  const row = await PriceBook.findOne({ country, level, service_type }).lean();
  if (!row) return res.status(404).json({ message: 'No matching price found' });

  const terms = (await TermsConditions.findOne().lean()) || {};
  const feePct = Number(terms.service_management_fee_pct ?? 5);
  const travelPerKm = Number(terms.travel_charge_per_km ?? 0.4);
  const threshold = Number(terms.travel_threshold_km ?? 50);
  const oohMult = Number(terms.out_of_hours_multiplier ?? 1.5);
  const wkndMult = Number(terms.weekend_holiday_multiplier ?? 2);

  let base = Number(row.base_rate);
  let travelFee = 0;
  if (Number(distance) > threshold) {
    travelFee = (Number(distance) - threshold) * travelPerKm;
  }

  let multiplier = 1;
  if (out_of_hours) multiplier *= oohMult;
  if (weekend) multiplier *= wkndMult;

  const priceAfterMultipliers = base * multiplier;
  const managementFee = (priceAfterMultipliers + travelFee) * (feePct / 100);
  const total = priceAfterMultipliers + travelFee + managementFee;

  res.json({
    region: row.region,
    country: row.country,
    supplier: row.supplier,
    currency: row.currency,
    payment_terms: row.payment_terms,
    level,
    service_type,
    base_price: base,
    travel_fee: Number(travelFee.toFixed(2)),
    multipliers_applied: { out_of_hours, weekend, multiplier },
    service_management_fee_pct: feePct,
    service_management_fee: Number(managementFee.toFixed(2)),
    total: Number(total.toFixed(2)),
  });
}


