import { parse } from 'csv-parse';
import multer from 'multer';
import { Price } from '../models/Price.js';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('file');

export async function listPrices(req, res) {
  try {
    const { region, country, supplier } = req.query;
    const query = {};
    if (region) query.region = region;
    if (country) query.country = country;
    if (supplier) query.supplier = supplier;

    const results = await Price.find(query).limit(500).lean();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch prices' });
  }
}

export async function upsertRow(row) {
  const region = row.region || row.Region || row.REGION || '';
  const country = row.country || row.Country || row.COUNTRY || '';
  const supplier = row.supplier || row.Supplier || row.SUPPLIER || '';
  const currency = row.currency || row.Currency || row.CURRENCY || '';
  const paymentTerms = row['Payment terms'] || row.paymentTerms || row.PaymentTerms || '';

  const data = { ...row };
  // Remove primary columns from data map to avoid duplication
  delete data.region; delete data.Region; delete data.REGION;
  delete data.country; delete data.Country; delete data.COUNTRY;
  delete data.supplier; delete data.Supplier; delete data.SUPPLIER;
  delete data.currency; delete data.Currency; delete data.CURRENCY;
  delete data['Payment terms']; delete data.paymentTerms; delete data.PaymentTerms;

  // Coerce numeric-looking values
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') {
      const cleaned = v.replace(/[$€£,\s]/g, '');
      const num = Number(cleaned);
      if (!Number.isNaN(num) && v.match(/[0-9]/)) {
        data[k] = num;
      }
    }
  }

  await Price.findOneAndUpdate(
    { region, country, supplier },
    { region, country, supplier, currency, paymentTerms, data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function uploadCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required (field name: file)' });
    }
    const rows = [];
    await new Promise((resolve, reject) => {
      parse(req.file.buffer, { columns: true, trim: true }, (err, records) => {
        if (err) return reject(err);
        records.forEach((r) => rows.push(r));
        resolve();
      });
    });

    for (const row of rows) {
      // eslint-disable-next-line no-await-in-loop
      await upsertRow(row);
    }

    res.json({ message: 'CSV imported', count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to import CSV' });
  }
}

export async function calculate(req, res) {
  try {
    const { region, country, supplier, keys = [] } = req.body || {};
    if (!region || !country || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ message: 'region, country, and keys[] are required' });
    }
    const doc = await Price.findOne({ region, country, ...(supplier ? { supplier } : {}) }).lean();
    if (!doc) return res.status(404).json({ message: 'No price row found' });

    let total = 0;
    const picked = {};
    for (const k of keys) {
      const v = doc.data?.[k];
      if (typeof v === 'number') {
        total += v;
        picked[k] = v;
      }
    }
    res.json({ region: doc.region, country: doc.country, supplier: doc.supplier, currency: doc.currency, picked, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Calculation failed' });
  }
}


