import { Router } from 'express';
import { listPrices } from '../controllers/priceController.js';

const router = Router();

router.get('/', listPrices);
// calculate moved to /api/calculate under calcRoutes

export default router;


