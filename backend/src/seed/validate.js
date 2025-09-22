import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db.js';
import { PriceBook } from '../models/PriceBook.js';

dotenv.config();

function assert(condition, message, issues) {
  if (!condition) issues.push(message);
}

async function main() {
  await connectToDatabase();

  const issues = [];
  const total = await PriceBook.estimatedDocumentCount();
  assert(total > 0, 'No documents found in price_book', issues);

  const regions = await PriceBook.distinct('region');
  assert(regions.length >= 5, 'Unexpected regions count', issues);

  // Per-country structural checks
  const countries = await PriceBook.distinct('country');
  for (const country of countries) {
    const docs = await PriceBook.find({ country }).lean();
    const svcSet = new Set(docs.map((d) => d.service_type));
    // Expect core 3 service types from the sheet
    ['Full Day Visit (8hrs)', 'Half Day Visit (4hrs)', 'Dispatch Ticket'].forEach((s) => {
      assert(svcSet.has(s), `Missing service_type ${s} for ${country}`, issues);
    });
    // Levels present
    const levels = new Set(docs.map((d) => d.level));
    ['L1', 'L2', 'L3'].forEach((l) => {
      assert(levels.has(l), `Missing level ${l} for ${country}`, issues);
    });
    // Currency and payment terms filled
    docs.forEach((d) => {
      assert(!!d.currency, `Missing currency for ${country}`, issues);
      assert(!!d.payment_terms, `Missing payment_terms for ${country}`, issues);
      assert(typeof d.base_rate === 'number' && d.base_rate > 0, `Invalid base_rate for ${country} ${d.service_type} ${d.level}`, issues);
    });
  }

  // Spot-check known values from provided sheet
  const checks = [
    { country: 'Australia', level: 'L1', service_type: 'Full Day Visit (8hrs)', currency: 'USD', base: 48000 },
    { country: 'United Kingdom', level: 'L1', service_type: 'Full Day Visit (8hrs)', currency: 'GBP', base: 36000 },
    { country: 'Japan', level: 'L1', service_type: 'Full Day Visit (8hrs)', currency: 'USD', base: 65000 },
    { country: 'India', level: 'L1', service_type: 'Full Day Visit (8hrs)', currency: 'USD', base: 5995 },
  ];

  for (const c of checks) {
    const doc = await PriceBook.findOne({ country: c.country, level: c.level, service_type: c.service_type }).lean();
    assert(!!doc, `Missing expected row ${JSON.stringify(c)}`, issues);
    if (doc) {
      assert(doc.currency === c.currency, `Currency mismatch for ${c.country}: got ${doc.currency} expected ${c.currency}`, issues);
      // Allow small rounding variance +/- 1 for integers
      const okBase = Math.abs((doc.base_rate ?? 0) - c.base) < 1;
      assert(okBase, `base_rate mismatch for ${c.country}: got ${doc.base_rate} expected ${c.base}`, issues);
    }
  }

  const result = { total, regionsCount: regions.length, countriesCount: countries.length, issuesCount: issues.length, issues: issues.slice(0, 50) };
  console.log(JSON.stringify(result, null, 2));

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


