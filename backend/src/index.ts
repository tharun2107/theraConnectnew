import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
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
import { therapistLeaveRoutes, adminLeaveRoutes } from './leaves/leave.route.js';
import therapyNotesRoutes from './api/therapy-notes/therapy-notes.routes.js';
import prisma from './utils/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Allowed origins list - add any additional exact origins here.
 * We also allow any vercel.app preview subdomain automatically (common for deployments).
 */
const allowedOrigins: string[] = [
  'https://thera-connectnew.vercel.app',
  'https://therabee.in',
  'https://www.therabee.in',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5173',
];

/**
 * Safe, non-throwing origin checker.
 * - returns true for exact matches in allowedOrigins
 * - returns true for any subdomain that ends with .vercel.app (Vercel previews)
 * - allows non-browser requests (no origin) such as curl/server-to-server
 * NOTE: Do NOT throw inside this callback — throwing prevents the CORS middleware from setting headers.
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    try {
      // allow non-browser requests (no origin header)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = String(origin).replace(/\/+$/, '');

      // exact match
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // allow vercel preview subdomains (e.g. my-app-branch.vercel.app)
      if (/\.vercel\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // if you need to allow more dynamic domains, add rules here
      // fallback: deny by returning false (no exception)
      console.warn('[CORS] Blocked origin:', normalizedOrigin);
      return callback(null, false);
    } catch (err) {
      // If something unexpected happens, default to deny but don't crash.
      console.error('[CORS] origin check error:', err);
      return callback(null, false);
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// --- MIDDLEWARE ORDER MATTERS ---
// 1) Simple request logger (good to see incoming origin & requests in Render logs)
app.use((req, _res, next) => {
  // log origin for debugging CORS issues
  // eslint-disable-next-line no-console
  console.log(`[REQ] ${req.method} ${req.originalUrl} - origin: ${req.headers.origin}`);
  next();
});

// 2) CORS - MUST be before routes and before any auth/validation that might reject an OPTIONS request.
app.options('*', cors(corsOptions)); // respond to preflight
app.use(cors(corsOptions));

// 3) Basic security headers but configured to avoid blocking Google Identity popups and embeds
//    We allow popups to communicate back using "same-origin-allow-popups" and disable COEP if not needed.
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  })
);

// 4) Relax opener policy explicitly (extra safety) — ensures window.postMessage isn't blocked for popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// 5) JSON parser and other middleware
app.use(express.json());

// Capture response status/time for logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// 6) ROUTES (keep these after CORS & parser)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/therapists', therapistRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/demo', demoRoutes);
app.use('/api/v1/therapist', therapistLeaveRoutes);
app.use('/api/v1/admin', adminLeaveRoutes);
app.use('/api/v1/therapy-notes', therapyNotesRoutes);

// Health endpoint to test reachability + CORS behavior
app.get('/api/v1/health', (req, res) => {
  res.setHeader('X-App', 'theraconnectnew');
  res.json({ status: 'ok', origin: req.headers.origin || null });
});

// Global error handler: ensures we respond gracefully (and avoid crashing during preflight)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // If CORS returned false from callback, the middleware does not automatically send a nice response.
  // We catch any thrown errors here and send a controlled response.
  // eslint-disable-next-line no-console
  console.error('[ERROR]', err && err.message ? err.message : err);
  if (err && (err as Error).message?.includes('CORS')) {
    return res.status(403).json({ message: 'CORS blocked this origin' });
  }
  const status = err?.status || 500;
  return res.status(status).json({ message: err?.message || 'Internal server error' });
});

// Boot sequence with Prisma DB connect + retries
const startServer = async () => {
  try {
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log('✓ Connected to database');
        break;
      } catch (error: any) {
        retries -= 1;
        // eslint-disable-next-line no-console
        console.warn(`Database connection failed. Retrying... (${5 - retries}/5)`, error?.message || '');
        if (retries === 0) throw error;
        // small backoff
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`✓ Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
