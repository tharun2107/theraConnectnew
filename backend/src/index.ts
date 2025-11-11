import express from 'express';
import cors, { CorsOptions } from "cors";
import dotenv from 'dotenv';

// Import all routes
import authRoutes from './api/auth/auth.routes.js';
import adminRoutes from './api/admin/admin.routes.js';
import parentRoutes from './api/parent/parent.routes.js';
import therapistRoutes from './api/therapist/therapist.routes.js';
import bookingRoutes from './api/booking/booking.routes.js';
import slotRoutes from './api/slots/slots.routes.js';
import feedbackRoutes from './api/feedback/feedback.routes.js';
import demoRoutes from './api/demo/demo.routes.js';
import prisma from './utils/prisma.js';

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins: string[] = [
  "https://thera-connectnew.vercel.app",
  "http://localhost:3000",
  "https://therabee.in",
  "https://www.therabee.in",
  "https://thera-connectnew-git-test3-tharuns-projects-f6787344.vercel.app",
];
// Global Middleware
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
app.use('/api/v1/demo', demoRoutes);

// Health endpoint for connectivity checks
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});


const startServer = async () => {
  try {
    // Connect to database with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log('✓ Connected to database');
        break;
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.warn(`Database connection failed, retrying... (${5 - retries}/5)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
    
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
