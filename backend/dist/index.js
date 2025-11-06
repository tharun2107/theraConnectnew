"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import all routes
const auth_routes_js_1 = __importDefault(require("./api/auth/auth.routes.js"));
const admin_routes_js_1 = __importDefault(require("./api/admin/admin.routes.js"));
const parent_routes_js_1 = __importDefault(require("./api/parent/parent.routes.js"));
const therapist_routes_js_1 = __importDefault(require("./api/therapist/therapist.routes.js"));
const booking_routes_js_1 = __importDefault(require("./api/booking/booking.routes.js"));
const slots_routes_js_1 = __importDefault(require("./api/slots/slots.routes.js"));
const feedback_routes_js_1 = __importDefault(require("./api/feedback/feedback.routes.js"));
const demo_routes_js_1 = __importDefault(require("./api/demo/demo.routes.js"));
const leave_route_js_1 = require("./leaves/leave.route.js");
const prisma_js_1 = __importDefault(require("./utils/prisma.js"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    "https://thera-connectnew.vercel.app",
    "http://localhost:3001",
];
// Global Middleware
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
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
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1/admin', admin_routes_js_1.default);
app.use('/api/v1/parents', parent_routes_js_1.default);
app.use('/api/v1/therapists', therapist_routes_js_1.default);
app.use('/api/v1/bookings', booking_routes_js_1.default);
app.use('/api/v1/slots', slots_routes_js_1.default);
app.use('/api/v1/feedback', feedback_routes_js_1.default);
app.use('/api/v1/demo', demo_routes_js_1.default);
app.use('/api/v1/therapist', leave_route_js_1.therapistLeaveRoutes);
app.use('/api/v1/admin', leave_route_js_1.adminLeaveRoutes);
// Health endpoint for connectivity checks
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to database with retry logic
        let retries = 5;
        while (retries > 0) {
            try {
                yield prisma_js_1.default.$connect();
                console.log('✓ Connected to database');
                break;
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    throw error;
                }
                console.warn(`Database connection failed, retrying... (${5 - retries}/5)`);
                yield new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            }
        }
        app.listen(PORT, () => {
            console.log(`✓ Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
});
startServer();
