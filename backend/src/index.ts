import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import all routes
import authRoutes from './api/auth/auth.routes.js';
import adminRoutes from './api/admin/admin.routes.js';
import parentRoutes from './api/parent/parent.routes.js';
import therapistRoutes from './api/therapist/therapist.routes.js';
import bookingRoutes from './api/booking/booking.routes.js';
import slotRoutes from './api/slots/slots.routes.js';
import feedbackRoutes from './api/feedback/feedback.routes.js';
// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Basic request logger (path, method, status)
app.use((req, res, next) => {
  const started = Date.now();
  // eslint-disable-next-line no-console
  console.log('[REQ]', req.method, req.originalUrl);
  res.on('finish', () => {
    const ms = Date.now() - started;
    // eslint-disable-next-line no-console
    console.log('[RES]', req.method, req.originalUrl, res.statusCode, ms + 'ms');
  });
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/therapists', therapistRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// Health endpoint for connectivity checks
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});


const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

startServer();