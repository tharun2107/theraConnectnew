import express from 'express';
import cors, { CorsOptions } from "cors";
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import all routes
import authRoutes from './api/auth/auth.routes.js';
import adminRoutes from './api/admin/admin.routes.js';
import parentRoutes from './api/parent/parent.routes.js';
// import therapistRoutes from './api/therapist/therapist.routes.js';
// import bookingRoutes from './api/booking/booking.routes.js';
// import slotRoutes from './api/slots/slots.routes.js';
// import feedbackRoutes from './api/feedback/feedback.routes.js';
import passport from 'passport';
import session from 'express-session'
import './services/passport.service.js';


// Load environment variables
dotenv.config();

const  {SESSION_SECRET} = process.env;

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins: string[] = [
  "https://thera-connectnew.vercel.app",
  "http://localhost:3000",
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
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET  || '67a583236610ed100c20c894fc239edbeb25301843d7dffeb7a0af869dcbb809d5c6159937d5affdc7ad33fcf430aeb452fa146be151a3ac1331eb9f134737a4',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10 * 1000,
    },
  }),
);

app.use(passport.initialize());
// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/parents', parentRoutes);
// app.use('/api/v1/therapists', therapistRoutes);
// app.use('/api/v1/bookings', bookingRoutes);
// app.use('/api/v1/slots', slotRoutes);
// app.use('/api/v1/feedback', feedbackRoutes);


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
