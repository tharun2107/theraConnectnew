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
// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/therapists', therapistRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/slots', slotRoutes);


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