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
const client_1 = require("@prisma/client");
// Import all routes
const auth_routes_js_1 = __importDefault(require("./api/auth/auth.routes.js"));
const admin_routes_js_1 = __importDefault(require("./api/admin/admin.routes.js"));
const parent_routes_js_1 = __importDefault(require("./api/parent/parent.routes.js"));
const therapist_routes_js_1 = __importDefault(require("./api/therapist/therapist.routes.js"));
const booking_routes_js_1 = __importDefault(require("./api/booking/booking.routes.js"));
const slots_routes_js_1 = __importDefault(require("./api/slots/slots.routes.js"));
const feedback_routes_js_1 = __importDefault(require("./api/feedback/feedback.routes.js"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
require("./services/passport.service.js");
// Load environment variables
dotenv_1.default.config();
const { SESSION_SECRET } = process.env;
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "https://thera-connectnew.vercel.app",
    "http://localhost:3000",
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
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "therabee is healthy"
    });
});
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: SESSION_SECRET || '67a583236610ed100c20c894fc239edbeb25301843d7dffeb7a0af869dcbb809d5c6159937d5affdc7ad33fcf430aeb452fa146be151a3ac1331eb9f134737a4',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10 * 1000,
    },
}));
app.use(passport_1.default.initialize());
// API Routes
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1/admin', admin_routes_js_1.default);
app.use('/api/v1/parents', parent_routes_js_1.default);
app.use('/api/v1/therapists', therapist_routes_js_1.default);
app.use('/api/v1/bookings', booking_routes_js_1.default);
app.use('/api/v1/slots', slots_routes_js_1.default);
app.use('/api/v1/feedback', feedback_routes_js_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.$connect();
        console.log('Connected to database');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
});
startServer();
