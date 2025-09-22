import path from 'path';
import xlsx from 'xlsx';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectToDatabase } from '../utils/db.js';
import { PriceBook } from '../models/PriceBook.js';
import { TermsConditions } from '../models/TermsConditions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  await connectToDatabase();
  const workbookPath = path.resolve(__dirname, '../../../frontend/public/Teceze Global Pricebook v0.1.xlsx');
  const wb = xlsx.readFile(workbookPath);
  console.log('Sheets:', wb.SheetNames);
  // Try to pick the first non-empty sheet
  let rows = [];
  let sheetUsed = null;
  let sheetObj = null;
  for (const sName of wb.SheetNames) {
    const sheet = wb.Sheets[sName];
    const r = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });
    if (r && r.length) {
      rows = r;
      sheetUsed = sName;
      sheetObj = sheet;
      console.log('Using sheet:', sName);
      console.log('First row keys sample:', Object.keys(r[0] || {}));
      break;
    }
  }

  // Clear existing
  await PriceBook.deleteMany({});

  const toNum = (v) => {
    if (typeof v === 'number') return v;
    if (!v || typeof v !== 'string') return undefined;
    // Remove currency prefixes like US$, €, £ and commas/spaces
    const n = Number(
      v
        .toString()
        .replace(/US\$|EUR|GBP|€|£/gi, '')
        .replace(/[,$\s]/g, '')
    );
    return Number.isNaN(n) ? undefined : n;
  };

  // Fallback: also load as a matrix to detect column positions (handles merged/multi-line headers)
  const matrix = xlsx.utils.sheet_to_json(sheetObj, { header: 1, defval: '' });
  const headerScanRows = matrix.slice(0, 15);
  const findIndex = (tokens) => {
    for (let r = 0; r < headerScanRows.length; r += 1) {
      const row = headerScanRows[r];
      for (let c = 0; c < row.length; c += 1) {
        const cell = String(row[c]).toLowerCase();
        if (tokens.every((t) => cell.includes(t))) return { r, c };
      }
    }
    return null;
  };

  // Locate key columns for identity fields
  const idxRegion = findIndex(['region'])?.c ?? 0;
  const idxCountry = findIndex(['country'])?.c ?? 1;
  const idxSupplier = findIndex(['supplier'])?.c ?? 2;
  const idxCurrency = findIndex(['currency'])?.c ?? 3;
  const idxPayTerms = findIndex(['payment', 'term'])?.c ?? 4;

  // Locate service bands
  const posFullDay = findIndex(['full', 'day']);
  const posHalfDay = findIndex(['1/2', '4hrs']) || findIndex(['half', '4hrs']);
  const posDispatch = findIndex(['dispatch', 'per hour']) || findIndex(['dispatch']);

  // From the found service label cell, levels L1..L5 usually appear in columns to the left/right; search same header row for nearest L1..L5 markers
  const locateLevelsRight = (rowIdx) => {
    const row = headerScanRows[rowIdx] || [];
    const cols = {};
    for (let c = 0; c < row.length; c += 1) {
      const v = String(row[c]).replace(/\s+/g, '').toUpperCase();
      if (['L1', 'L2', 'L3', 'L4', 'L5'].includes(v) && cols[v] == null) cols[v] = c;
    }
    return cols;
  };

  const fullDayCols = posFullDay ? locateLevelsRight(posFullDay.r) : {};
  const halfDayCols = posHalfDay ? locateLevelsRight(posHalfDay.r) : {};
  const dispatchCols = posDispatch ? locateLevelsRight(posDispatch.r) : {};

  // Incident columns
  const idx9x5x4 = findIndex(['9x5x4'])?.c;
  const idx247x4 = findIndex(['24x7x4'])?.c;
  const idxSBD = findIndex(['sbd', 'resolution'])?.c;
  const idxNBD = findIndex(['nbd', 'resolution'])?.c;
  const idx2BD = findIndex(['2bd', 'resolution'])?.c;
  const idx3BD = findIndex(['3bd', 'resolution'])?.c;
  const idx4BD = findIndex(['4', 'bd', 'resolution'])?.c;
  const idxAddHour = findIndex(['additional', 'hour'])?.c;

  const entries = [];
  // Confirmed column indices from the user
  const fullDayIdx = { L1: 5, L2: 7, L3: 9, L4: 11, L5: 13 };
  const halfDayIdx = { L1: 15, L2: 16, L3: 17 };
  const dispatchIdx = { L1: 18, L2: 19, L3: 20 };
  const idxIncident = { '9x5x4': 22, '24x7x4': 23, SBD: 24, NBD: 25, '2BD': 26, '3BD': 27, AdditionalHour: 28, '4BD': 31 };

  // Filter to data rows (skip header deck)
  const dataRows = matrix.filter((arr) => arr && arr[idxRegion] && arr[idxCountry] && typeof arr[idxRegion] === 'string');

  const pushEntry = (entriesArr, arr, level, service_type, colIdx) => {
    const base_rate = toNum(arr[colIdx]);
    if (base_rate === undefined) return;
    entriesArr.push({
      region: arr[idxRegion] || '',
      country: arr[idxCountry] || '',
      supplier: arr[idxSupplier] || 'Direct',
      currency: arr[idxCurrency] || '',
      payment_terms: arr[idxPayTerms] || '',
      level,
      service_type,
      base_rate,
      incident_rates: {
        '9x5x4': toNum(arr[idxIncident['9x5x4']]),
        '24x7x4': toNum(arr[idxIncident['24x7x4']]),
        SBD: toNum(arr[idxIncident.SBD]),
        NBD: toNum(arr[idxIncident.NBD]),
        '2BD': toNum(arr[idxIncident['2BD']]),
        '3BD': toNum(arr[idxIncident['3BD']]),
        '4BD': toNum(arr[idxIncident['4BD']]),
        AdditionalHour: toNum(arr[idxIncident.AdditionalHour])
      },
      additional_hour_rate: toNum(arr[idxIncident.AdditionalHour])
    });
  };

  for (const arr of dataRows) {
    Object.keys(fullDayIdx).forEach((lvl) => pushEntry(entries, arr, lvl, 'Full Day Visit (8hrs)', fullDayIdx[lvl]));
    Object.keys(halfDayIdx).forEach((lvl) => pushEntry(entries, arr, lvl, 'Half Day Visit (4hrs)', halfDayIdx[lvl]));
    Object.keys(dispatchIdx).forEach((lvl) => pushEntry(entries, arr, lvl, 'Dispatch Ticket', dispatchIdx[lvl]));
  }

  if (entries.length) {
    await PriceBook.insertMany(entries);
    console.log(`Inserted ${entries.length} price book rows`);
  } else {
    console.warn('No rows parsed from Excel. Check headers.');
  }

  // Seed terms and conditions if not present
  const existing = await TermsConditions.findOne();
  if (!existing) {
    await TermsConditions.create({});
    console.log('Seeded default Terms & Conditions');
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


