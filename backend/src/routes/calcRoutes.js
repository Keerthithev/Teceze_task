import { Router } from 'express';
import { getRegions, getCountries, calculateQuote } from '../controllers/calculatorController.js';
import { PriceBook } from '../models/PriceBook.js';

const router = Router();

router.get('/regions', getRegions);
router.get('/countries', getCountries);
router.post('/calculate', calculateQuote);

// Simple stats endpoint for verification
router.get('/stats', async (req, res) => {
  const total = await PriceBook.estimatedDocumentCount();
  const regions = await PriceBook.distinct('region');
  const countries = await PriceBook.distinct('country');
  res.json({ total, regionsCount: regions.length, countriesCount: countries.length, regions });
});

export default router;


