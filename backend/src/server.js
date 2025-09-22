import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase } from './utils/db.js';
import priceRoutes from './routes/priceRoutes.js';
import calcRoutes from './routes/calcRoutes.js';

dotenv.config();

const app = express();

// Security and middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

const allowedOrigin = process.env.FRONTEND_URL || '*';
const originFn = (origin, callback) => {
  if (!origin) return callback(null, true);
  const list = allowedOrigin.split(',').map((s) => s.trim());
  if (list.includes('*') || list.includes(origin)) return callback(null, true);
  return callback(null, false);
};
app.use(cors({ origin: originFn, credentials: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/prices', priceRoutes);
app.use('/api', calcRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 5000;

// Start server after DB connection
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });


