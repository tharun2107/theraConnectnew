"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.cancelRecurringBookingHandler = exports.getUpcomingSessionsHandler = exports.getRecurringBookingsHandler = exports.createRecurringBookingHandler = exports.getTherapistBookingsHandler = exports.getMyBookingsHandler = exports.createBookingHandler = exports.getAvailableSlotsHandler = exports.markSessionCompletedHandler = void 0;
const bookingService = __importStar(require("./booking.service"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const markSessionCompletedHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const updatedBooking = yield bookingService.markSessionCompleted(bookingId);
        const parentId = yield prisma_1.default.booking.findUnique({
            where: { id: bookingId },
            select: {
                parentId: true
            }
        });
        if (!parentId) {
            res.json("parent not found");
            return;
        }
        const sessionCompletedHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Session Completed - Therabee</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                            margin: 0;
                            padding: 20px;
                            min-height: 100vh;
                        }
                        
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 20px;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                        }
                        
                        .header {
                            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                            padding: 50px 40px 40px;
                            text-align: center;
                            color: white;
                            position: relative;
                        }
                        
                        .completion-badge {
                            background: rgba(255, 255, 255, 0.2);
                            padding: 12px 25px;
                            border-radius: 50px;
                            display: inline-block;
                            margin-top: 20px;
                            font-weight: 600;
                            backdrop-filter: blur(10px);
                            font-size: 14px;
                        }
                        
                        .logo {
                            font-size: 32px;
                            font-weight: 700;
                            margin-bottom: 15px;
                        }
                        
                        .content {
                            padding: 50px 40px;
                        }
                        
                        .greeting {
                            font-size: 24px;
                            font-weight: 700;
                            color: #2d3748;
                            margin-bottom: 25px;
                            text-align: center;
                        }
                        
                        .success-icon {
                            text-align: center;
                            font-size: 64px;
                            margin-bottom: 25px;
                        }
                        
                        .message {
                            font-size: 16px;
                            color: #4a5568;
                            margin-bottom: 25px;
                            line-height: 1.7;
                            text-align: center;
                        }
                        
                        .next-steps {
                            background: #f0fff4;
                            border-radius: 15px;
                            padding: 30px;
                            margin: 30px 0;
                            border: 2px solid #c6f6d5;
                        }
                        
                        .steps-title {
                            font-weight: 600;
                            color: #2d3748;
                            margin-bottom: 20px;
                            text-align: center;
                            font-size: 18px;
                        }
                        
                        .step-item {
                            display: flex;
                            align-items: center;
                            margin: 15px 0;
                            padding: 15px;
                            background: white;
                            border-radius: 10px;
                            border-left: 4px solid #48bb78;
                        }
                        
                        .step-number {
                            background: #48bb78;
                            color: white;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 600;
                            margin-right: 15px;
                            flex-shrink: 0;
                        }
                        
                        .step-text {
                            color: #4a5568;
                            font-size: 14px;
                        }
                        
                        .cta-section {
                            text-align: center;
                            margin: 40px 0 30px;
                        }
                        
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                            color: white;
                            padding: 16px 45px;
                            text-decoration: none;
                            border-radius: 12px;
                            font-weight: 600;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 10px 30px rgba(72, 187, 120, 0.3);
                        }
                        
                        .cta-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 15px 40px rgba(72, 187, 120, 0.4);
                        }
                        
                        .feedback-encouragement {
                            text-align: center;
                            color: #718096;
                            font-size: 14px;
                            margin-top: 20px;
                            font-style: italic;
                        }
                        
                        .footer {
                            background: #1a202c;
                            color: white;
                            padding: 40px;
                            text-align: center;
                        }
                        
                        .footer-logo {
                            font-size: 24px;
                            font-weight: 700;
                            margin-bottom: 20px;
                            color: white;
                        }
                        
                        @media (max-width: 600px) {
                            .content {
                                padding: 30px 25px;
                            }
                            
                            .header {
                                padding: 40px 25px 30px;
                            }
                            
                            .step-item {
                                flex-direction: column;
                                text-align: center;
                                gap: 10px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="logo">Therabee</div>
                            <div class="completion-badge">Session Successfully Completed</div>
                        </div>
                        
                        <div class="content">
                            <div class="success-icon">✅</div>
                            
                            <div class="greeting">Great Job Completing Your Session! 🌟</div>
                            
                            <p class="message">
                                Your recent therapy session has been successfully completed. We hope it was a helpful and insightful experience that brought you closer to your wellness goals.
                            </p>
                            
                            <div class="next-steps">
                                <div class="steps-title">Your Next Steps</div>
                                
                                <div class="step-item">
                                    <div class="step-number">1</div>
                                    <div class="step-text">
                                        <strong>Review Session Insights</strong><br>
                                        Access detailed notes and recommendations in your account
                                    </div>
                                </div>
                                
                                <div class="step-item">
                                    <div class="step-number">2</div>
                                    <div class="step-text">
                                        <strong>Practice Techniques</strong><br>
                                        Implement the strategies discussed during your session
                                    </div>
                                </div>
                                
                                <div class="step-item">
                                    <div class="step-number">3</div>
                                    <div class="step-text">
                                        <strong>Schedule Follow-up</strong><br>
                                        Book your next session to continue your progress
                                    </div>
                                </div>
                            </div>
                            
                            <div class="cta-section">
                                <a href="#" class="cta-button">View Session Details</a>
                            </div>
                            
                            <p class="feedback-encouragement">
                                "Progress, not perfection. Every session brings you closer to your goals."
                            </p>
                            
                            <p class="message" style="text-align: center; color: #718096; font-size: 14px; margin-top: 30px;">
                                Thank you for trusting us with your wellness journey. Your commitment to growth is inspiring.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <div class="footer-logo">Therabee</div>
                            <p style="color: #cbd5e0; margin-bottom: 20px;">Supporting your mental wellness journey</p>
                            <p style="color: #a0aec0; font-size: 14px;">
                                Need assistance? Contact our support team at help@therabee.com
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `.trim();
        const sessionCompletedText = `
                SESSION COMPLETED - THERABEE

                Your recent therapy session has been successfully completed.

                We hope it was a helpful and insightful experience that brought you closer to your wellness goals.

                NEXT STEPS:

                1. REVIEW SESSION INSIGHTS
                - Access detailed notes and recommendations in your Therabee account
                - Review any exercises or techniques discussed

                2. PRACTICE TECHNIQUES
                - Implement the strategies discussed during your session
                - Continue with any recommended exercises

                3. SCHEDULE FOLLOW-UP
                - Book your next session to maintain progress
                - Continue your wellness journey

                You can view complete session details and any recommendations in your Therabee account.

                Remember: Progress, not perfection. Every session brings you closer to your goals.

                Thank you for trusting us with your wellness journey. Your commitment to growth is inspiring.

                Best regards,
                Therabee Team

                Need assistance? Contact our support team at help@therabee.com
                `.trim();
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotificationAfterAnEventSessionCompleted({
        //     userId: parentId.parentId,
        //     message: sessionCompletedText,
        //     welcomeHtml:sessionCompletedHTML,
        //     sendAt: new Date()
        // });
        res.status(200).json({
            message: 'Session marked as completed',
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error('[booking.markSessionCompleted][ERROR]', error);
        res.status(400).json({ message: error.message || 'Failed to mark session as completed' });
    }
});
exports.markSessionCompletedHandler = markSessionCompletedHandler;
const getAvailableSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validated = (_b = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.validated) === null || _b === void 0 ? void 0 : _b.query;
        const { therapistId, date } = validated !== null && validated !== void 0 ? validated : req.query;
        console.log('[booking.getAvailableSlots] params=', { therapistId, date });
        const slots = yield bookingService.getAvailableSlots(therapistId, date);
        console.log('[booking.getAvailableSlots] results=', slots.length);
        res.status(200).json(slots);
    }
    catch (error) {
        console.error('[booking.getAvailableSlots][ERROR]', error);
        res.status(400).json({ message: error.message || 'Failed to get slots' });
    }
});
exports.getAvailableSlotsHandler = getAvailableSlotsHandler;
const createBookingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[booking.create] body=', req.body);
        const parentProfile = yield prisma_1.default.parentProfile.findUnique({ where: { userId: req.user.userId } });
        if (!parentProfile)
            return res.status(404).json({ message: 'Parent profile not found' });
        const booking = yield bookingService.createBooking(parentProfile.id, req.body);
        const parent = yield prisma_1.default.parentProfile.findFirst({
            where: { id: parentProfile.id },
            select: {
                userId: true,
                name: true
            },
        });
        if (!(parent === null || parent === void 0 ? void 0 : parent.userId)) {
            return res.status(404).json({
                message: "Parent does not exist in user profile",
            });
        }
        const findTimeSlot = yield prisma_1.default.timeSlot.findUnique({
            where: {
                id: req.body.timeSlotId
            },
            select: {
                startTime: true,
                endTime: true,
                therapist: {
                    select: {
                        userId: true,
                        name: true
                    }
                }
            }
        });
        if (!findTimeSlot) {
            return res.status(404).json({ message: "TimeSlot not found" });
        }
        // Extract the userId strings
        const parentUserId = parent.userId;
        const therapistUserId = findTimeSlot.therapist.userId;
        // ==================== PARENT EMAIL ====================
        const parentHTML = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Booking Confirmed - Therabee</title>
                            <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }

                            body {
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                line-height: 1.6;
                                color: #333333;
                                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                                margin: 0;
                                padding: 20px;
                                min-height: 100vh;
                            }

                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                border-radius: 20px;
                                overflow: hidden;
                                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                            }

                            .header {
                                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                                padding: 50px 40px 40px;
                                text-align: center;
                                color: white;
                                position: relative;
                            }

                            .confirmation-badge {
                                background: rgba(255, 255, 255, 0.2);
                                padding: 12px 25px;
                                border-radius: 50px;
                                display: inline-block;
                                margin-top: 20px;
                                font-weight: 600;
                                backdrop-filter: blur(10px);
                                font-size: 14px;
                            }

                            .logo {
                                font-size: 32px;
                                font-weight: 700;
                                margin-bottom: 15px;
                            }

                            .content {
                                padding: 50px 40px;
                            }

                            .greeting {
                                font-size: 24px;
                                font-weight: 700;
                                color: #2d3748;
                                margin-bottom: 25px;
                            }

                            .message {
                                font-size: 16px;
                                color: #4a5568;
                                margin-bottom: 25px;
                                line-height: 1.7;
                            }

                            .booking-details {
                                background: #ebf8ff;
                                border-radius: 15px;
                                padding: 30px;
                                margin: 30px 0;
                                border: 2px solid #bee3f8;
                            }

                            .details-title {
                                font-weight: 600;
                                color: #2d3748;
                                margin-bottom: 20px;
                                text-align: center;
                                font-size: 18px;
                            }

                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                margin: 15px 0;
                                padding: 12px 0;
                                border-bottom: 1px solid #e2e8f0;
                            }

                            .detail-label {
                                font-weight: 500;
                                color: #4a5568;
                            }

                            .detail-value {
                                font-weight: 600;
                                color: #2d3748;
                                text-align: right;
                            }

                            .join-instructions {
                                background: #f0fff4;
                                border-radius: 12px;
                                padding: 25px;
                                margin: 25px 0;
                                border-left: 4px solid #48bb78;
                            }

                            .instructions-title {
                                font-weight: 600;
                                color: #2d3748;
                                margin-bottom: 15px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            }

                            .instruction-step {
                                margin: 10px 0;
                                padding-left: 10px;
                                color: #4a5568;
                            }

                            .reminder {
                                background: #fffaf0;
                                border-radius: 12px;
                                padding: 20px;
                                margin: 25px 0;
                                text-align: center;
                                border: 1px solid #fbd38d;
                            }

                            .reminder-icon {
                                font-size: 24px;
                                margin-bottom: 10px;
                            }

                            .cta-section {
                                text-align: center;
                                margin: 40px 0 30px;
                            }

                            .cta-button {
                                display: inline-block;
                                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                                color: white;
                                padding: 16px 45px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 16px;
                                transition: all 0.3s ease;
                                box-shadow: 0 10px 30px rgba(66, 153, 225, 0.3);
                            }

                            .cta-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 15px 40px rgba(66, 153, 225, 0.4);
                            }

                            .footer {
                                background: #1a202c;
                                color: white;
                                padding: 40px;
                                text-align: center;
                            }

                            .footer-logo {
                                font-size: 24px;
                                font-weight: 700;
                                margin-bottom: 20px;
                                color: white;
                            }

                            @media (max-width: 600px) {
                                .content {
                                    padding: 30px 25px;
                                }
                                
                                .header {
                                    padding: 40px 25px 30px;
                                }
                                
                                .detail-row {
                                    flex-direction: column;
                                    gap: 5px;
                                }
                                
                                .detail-value {
                                    text-align: left;
                                }
                            }
                            </style>
                            </head>
                            <body>
                            <div class="email-container">
                            <div class="header">
                                <div class="logo">Therabee</div>
                                <div class="confirmation-badge">Booking Confirmed Successfully</div>
                            </div>

                            <div class="content">
                                <div class="greeting">Hi ${parent.name || 'there'}! 🎉</div>
                                
                                <p class="message">
                                    Great news! Your therapy session has been successfully booked and confirmed. We're excited to support you on your wellness journey.
                                </p>
                                
                                <div class="booking-details">
                                    <div class="details-title">Session Details</div>
                                    
                                    <div class="detail-row">
                                        <span class="detail-label">Booking ID:</span>
                                        <span class="detail-value">${booking.id}</span>
                                    </div>
                                    
                                    <div class="detail-row">
                                        <span class="detail-label">Date & Time:</span>
                                        <span class="detail-value">${new Date(findTimeSlot.startTime).toLocaleString()} - ${new Date(findTimeSlot.endTime).toLocaleString()}</span>
                                    </div>
                                    
                                    <div class="detail-row">
                                        <span class="detail-label">Session Type:</span>
                                        <span class="detail-value">Video Consultation</span>
                                    </div>
                                    
                                    <div class="detail-row">
                                        <span class="detail-label">Status:</span>
                                        <span class="detail-value" style="color: #48bb78;">Confirmed ✅</span>
                                    </div>
                                </div>
                                
                                <div class="join-instructions">
                                    <div class="instructions-title">
                                        <span>📅</span>
                                        How to Join Your Session
                                    </div>
                                    
                                    <div class="instruction-step">1. Log in to your Therabee account 10 minutes before the session</div>
                                    <div class="instruction-step">2. Go to "My Sessions" in your dashboard</div>
                                    <div class="instruction-step">3. Click "Join Session" when the button becomes active</div>
                                    <div class="instruction-step">4. Ensure you have a stable internet connection</div>
                                </div>
                                
                                <div class="reminder">
                                    <div class="reminder-icon">⏰</div>
                                    <div style="font-weight: 600; color: #744210; margin-bottom: 5px;">
                                        Session Reminder
                                    </div>
                                    <div style="color: #744210; font-size: 14px;">
                                        We'll send you a reminder 1 hour before your session starts
                                    </div>
                                </div>
                                
                                <div class="cta-section">
                                    <a href="#" class="cta-button">View Session Details</a>
                                </div>
                                
                                <p class="message" style="text-align: center; color: #718096; font-size: 14px;">
                                    We look forward to helping you achieve your wellness goals!
                                </p>
                            </div>

                            <div class="footer">
                                <div class="footer-logo">Therabee</div>
                                <p style="color: #cbd5e0; margin-bottom: 20px;">Your partner in mental wellness</p>
                                <p style="color: #a0aec0; font-size: 14px;">
                                    Questions about your booking? Contact support@therabee.com
                                </p>
                            </div>
                            </div>
                            </body>
                            </html>
                            `.trim();
        const parentText = `
                            BOOKING CONFIRMED - THERABEE

                            Hi ${parent.name || 'there'}!

                            Great news! Your therapy session has been successfully booked and confirmed.

                            SESSION DETAILS:
                            • Booking ID: ${booking.id}
                            • Date & Time: ${new Date(findTimeSlot.startTime).toLocaleString()} - ${new Date(findTimeSlot.endTime).toLocaleString()}
                            • Session Type: Video Consultation
                            • Status: Confirmed ✅

                            HOW TO JOIN YOUR SESSION:
                            1. Log in to your Therabee account 10 minutes before the session
                            2. Go to "My Sessions" in your dashboard
                            3. Click "Join Session" when the button becomes active
                            4. Ensure you have a stable internet connection

                            REMINDER: We'll send you a notification 1 hour before your session starts.

                            You can view and manage your session details in your Therabee dashboard.

                            We look forward to helping you on your wellness journey!

                            Warm regards,
                            The Therabee Team

                            Questions about your booking? Contact support@therabee.com
                            `.trim();
        // ==================== THERAPIST EMAIL ====================
        const therapistHTML = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>New Session Booking - Therabee</title>
                            <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }

                            body {
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                line-height: 1.6;
                                color: #333333;
                                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                                margin: 0;
                                padding: 20px;
                                min-height: 100vh;
                            }

                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                border-radius: 20px;
                                overflow: hidden;
                                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                            }

                            .header {
                                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                                padding: 50px 40px 40px;
                                text-align: center;
                                color: white;
                                position: relative;
                            }

                            .notification-badge {
                                background: rgba(255, 255, 255, 0.2);
                                padding: 12px 25px;
                                border-radius: 50px;
                                display: inline-block;
                                margin-top: 20px;
                                font-weight: 600;
                                backdrop-filter: blur(10px);
                                font-size: 14px;
                            }

                            .logo {
                                font-size: 32px;
                                font-weight: 700;
                                margin-bottom: 15px;
                            }

                            .content {
                                padding: 50px 40px;
                            }

                            .greeting {
                                font-size: 24px;
                                font-weight: 700;
                                color: #2d3748;
                                margin-bottom: 25px;
                            }

                            .message {
                                font-size: 16px;
                                color: #4a5568;
                                margin-bottom: 25px;
                                line-height: 1.7;
                            }

                            .booking-card {
                                background: #fffaf0;
                                border-radius: 15px;
                                padding: 30px;
                                margin: 30px 0;
                                border: 2px solid #fbd38d;
                            }

                            .card-title {
                                font-weight: 600;
                                color: #2d3748;
                                margin-bottom: 20px;
                                text-align: center;
                                font-size: 18px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 10px;
                            }

                            .detail-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                                margin-top: 20px;
                            }

                            .detail-item {
                                padding: 15px;
                                background: white;
                                border-radius: 10px;
                                text-align: center;
                                border: 1px solid #e2e8f0;
                            }

                            .detail-label {
                                font-size: 12px;
                                color: #718096;
                                margin-bottom: 5px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }

                            .detail-value {
                                font-weight: 600;
                                color: #2d3748;
                                font-size: 14px;
                            }

                            .preparation-tips {
                                background: #f0fff4;
                                border-radius: 12px;
                                padding: 25px;
                                margin: 25px 0;
                            }

                            .tips-title {
                                font-weight: 600;
                                color: #2d3748;
                                margin-bottom: 15px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            }

                            .tip-item {
                                margin: 12px 0;
                                padding-left: 10px;
                                color: #4a5568;
                                display: flex;
                                align-items: flex-start;
                                gap: 10px;
                            }

                            .tip-icon {
                                color: #48bb78;
                                font-weight: bold;
                                flex-shrink: 0;
                                margin-top: 2px;
                            }

                            .action-section {
                                text-align: center;
                                margin: 40px 0 30px;
                            }

                            .action-button {
                                display: inline-block;
                                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                                color: white;
                                padding: 16px 45px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 16px;
                                transition: all 0.3s ease;
                                box-shadow: 0 10px 30px rgba(237, 137, 54, 0.3);
                                margin: 0 10px;
                            }

                            .action-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 15px 40px rgba(237, 137, 54, 0.4);
                            }

                            .secondary-button {
                                background: #e2e8f0;
                                color: #4a5568;
                                box-shadow: none;
                            }

                            .footer {
                                background: #1a202c;
                                color: white;
                                padding: 40px;
                                text-align: center;
                            }

                            .footer-logo {
                                font-size: 24px;
                                font-weight: 700;
                                margin-bottom: 20px;
                                color: white;
                            }

                            @media (max-width: 600px) {
                                .content {
                                    padding: 30px 25px;
                                }
                                
                                .header {
                                    padding: 40px 25px 30px;
                                }
                                
                                .detail-grid {
                                    grid-template-columns: 1fr;
                                }
                                
                                .action-button {
                                    display: block;
                                    margin: 10px 0;
                                }
                            }
                            </style>
                            </head>
                            <body>
                            <div class="email-container">
                            <div class="header">
                                <div class="logo">Therabee</div>
                                <div class="notification-badge">New Session Booking</div>
                            </div>

                            <div class="content">
                                <div class="greeting">Hi Dr. ${findTimeSlot.therapist.name || 'there'}! 📅</div>
                                
                                <p class="message">
                                    Great news! A parent has booked a session with you. Please review the session details below and prepare accordingly.
                                </p>
                                
                                <div class="booking-card">
                                    <div class="card-title">
                                        <span>🎯</span>
                                        Session Booking Details
                                    </div>
                                    
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <div class="detail-label">Booking ID</div>
                                            <div class="detail-value">${booking.id}</div>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <div class="detail-label">Session Date</div>
                                            <div class="detail-value">${new Date(findTimeSlot.startTime).toLocaleDateString()}</div>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <div class="detail-label">Start Time</div>
                                            <div class="detail-value">${new Date(findTimeSlot.startTime).toLocaleTimeString()}</div>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <div class="detail-label">End Time</div>
                                            <div class="detail-value">${new Date(findTimeSlot.endTime).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="preparation-tips">
                                    <div class="tips-title">
                                        <span>💡</span>
                                        Session Preparation Tips
                                    </div>
                                    
                                    <div class="tip-item">
                                        <span class="tip-icon">•</span>
                                        <span class="tip-text">Review the client's profile and any previous session notes</span>
                                    </div>
                                    
                                    <div class="tip-item">
                                        <span class="tip-icon">•</span>
                                        <span class="tip-text">Prepare your virtual therapy environment for optimal focus</span>
                                    </div>
                                    
                                    <div class="tip-item">
                                        <span class="tip-icon">•</span>
                                        <span class="tip-text">Test your audio and video equipment beforehand</span>
                                    </div>
                                    
                                    <div class="tip-item">
                                        <span class="tip-icon">•</span>
                                        <span class="tip-text">Be ready to join 5 minutes before the scheduled start time</span>
                                    </div>
                                </div>
                                
                                <div class="action-section">
                                    <a href="#" class="action-button">View Client Details</a>
                                    <a href="#" class="action-button secondary-button">Manage Schedule</a>
                                </div>
                                
                                <p class="message" style="text-align: center; color: #718096; font-size: 14px;">
                                    Thank you for providing your expertise and support to our clients. Your dedication makes a difference.
                                </p>
                            </div>

                            <div class="footer">
                                <div class="footer-logo">Therabee</div>
                                <p style="color: #cbd5e0; margin-bottom: 20px;">Professional Therapy Platform</p>
                                <p style="color: #a0aec0; font-size: 14px;">
                                    Therapist support: therapists@therabee.com
                                </p>
                            </div>
                            </div>
                            </body>
                            </html>
                            `.trim();
        const therapistText = `
                            NEW SESSION BOOKING - THERABEE

                            Hi Dr. ${findTimeSlot.therapist.name || 'there'}!

                            Good news! A parent has booked a session with you.

                            SESSION DETAILS:
                            • Booking ID: ${booking.id}
                            • Date: ${new Date(findTimeSlot.startTime).toLocaleDateString()}
                            • Time: ${new Date(findTimeSlot.startTime).toLocaleTimeString()} - ${new Date(findTimeSlot.endTime).toLocaleTimeString()}
                            PREPARATION TIPS:
                            • Review the client's profile and previous session notes
                            • Prepare your virtual therapy environment for optimal focus
                            • Test your audio and video equipment beforehand
                            • Be ready to join 5 minutes before the scheduled start time

                            Please make sure to prepare for the session and be available at the scheduled time.

                            You can view complete client details and manage your schedule in your therapist dashboard.

                            Thank you for providing your expertise and support to our clients.

                            Best regards,
                            Therabee Team

                            Therapist support: therapists@therabee.com
                            `.trim();
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotificationToTherapistSessionBooked({
        // userId:findTimeSlot.therapist.userId,
        // message: therapistText,
        // welcomeHtml:therapistHTML,
        // sendAt: new Date(),
        // })
        // await sendNotificationBookingConfirmed({
        // userId:parent.userId,
        // message: parentText,
        // welcomeHtml:parentHTML,
        // sendAt: new Date(),
        // })
        const reminderTime = new Date(new Date(findTimeSlot.startTime).getTime() - 15 * 60 * 1000);
        // await sendNotification({
        // userId: parent.userId,
        // message: `Reminder: Your session starts in 15 minutes.`,
        // sendAt: reminderTime
        // });
        // // Schedule Therapist Reminder
        // await sendNotification({
        // userId: findTimeSlot.therapist.userId,
        // message: `Reminder: Your upcoming session starts in 15 minutes.`,
        // sendAt: reminderTime
        // });
        res.status(201).json(booking);
    }
    catch (error) {
        console.error('[booking.create][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
});
exports.createBookingHandler = createBookingHandler;
const getMyBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield bookingService.getMyBookings(req.user.userId, req.user.role);
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve bookings' });
    }
});
exports.getMyBookingsHandler = getMyBookingsHandler;
const getTherapistBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { therapistId } = req.params;
        if (!therapistId) {
            return res.status(400).json({ message: 'Therapist ID is required' });
        }
        const bookings = yield bookingService.getTherapistBookings(therapistId);
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error('[booking.getTherapistBookings][ERROR]', error);
        res.status(500).json({ message: error.message || 'Failed to retrieve therapist bookings' });
    }
});
exports.getTherapistBookingsHandler = getTherapistBookingsHandler;
/**
 * POST /api/parent/recurring-bookings
 * Create a recurring booking for a child
 */
const createRecurringBookingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const bookingData = req.body;
        console.log('[createRecurringBooking] Request data:', {
            userId,
            childId: bookingData.childId,
            therapistId: bookingData.therapistId,
            slotTime: bookingData.slotTime,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            recurrencePattern: bookingData.recurrencePattern
        });
        const recurringBooking = yield bookingService.recurringBookingService.createRecurringBooking(userId, bookingData);
        return res.status(201).json({
            success: true,
            message: 'Recurring booking created successfully. Your child now has daily sessions!',
            data: {
                recurringBookingId: recurringBooking.id,
                slotTime: recurringBooking.slotTime,
                startDate: recurringBooking.startDate,
                endDate: recurringBooking.endDate,
                recurrencePattern: recurringBooking.recurrencePattern
            }
        });
    }
    catch (error) {
        console.error('[createRecurringBooking] Error:', error);
        if (error instanceof Error) {
            // Log the full error for debugging
            console.error('[createRecurringBooking] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            // Handle specific error types
            if (error.message.includes('not found') || error.message.includes('does not belong')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('already have') || error.message.includes('not available')) {
                return res.status(409).json({ success: false, message: error.message });
            }
            if (error.message.includes('Cannot create') ||
                error.message.includes('Only') ||
                error.message.includes('in the past') ||
                error.message.includes('Invalid') ||
                error.message.includes('format') ||
                error.message.includes('required')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            // Return the error message for other known errors
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create recurring booking'
            });
        }
        // Unknown error type
        return res.status(500).json({
            success: false,
            message: 'Failed to create recurring booking. Please try again or contact support.'
        });
    }
});
exports.createRecurringBookingHandler = createRecurringBookingHandler;
/**
 * GET /api/parent/recurring-bookings
 * Get all recurring bookings for the parent
 */
const getRecurringBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const recurringBookings = yield bookingService.recurringBookingService.getParentRecurringBookings(userId);
        return res.status(200).json({
            success: true,
            message: 'Recurring bookings retrieved successfully',
            data: {
                totalRecurringBookings: recurringBookings.length,
                recurringBookings: recurringBookings
            }
        });
    }
    catch (error) {
        console.error('Error fetching recurring bookings:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve recurring bookings' });
    }
});
exports.getRecurringBookingsHandler = getRecurringBookingsHandler;
/**
 * GET /api/parent/recurring-bookings/:recurringBookingId/sessions
 * Get upcoming sessions for a specific recurring booking
 */
const getUpcomingSessionsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { recurringBookingId } = req.params;
        const sessions = yield bookingService.recurringBookingService.getUpcomingSessionsForRecurring(userId, recurringBookingId);
        return res.status(200).json({
            success: true,
            message: 'Upcoming sessions retrieved successfully',
            data: {
                totalUpcomingSessions: sessions.length,
                sessions: sessions
            }
        });
    }
    catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Failed to retrieve upcoming sessions' });
    }
});
exports.getUpcomingSessionsHandler = getUpcomingSessionsHandler;
/**
 * DELETE /api/parent/recurring-bookings/:recurringBookingId
 * Cancel a recurring booking (cancels all future sessions)
 */
const cancelRecurringBookingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { recurringBookingId } = req.params;
        const cancelled = yield bookingService.recurringBookingService.cancelRecurringBooking(userId, recurringBookingId);
        return res.status(200).json({
            success: true,
            message: 'Recurring booking cancelled successfully. All future sessions have been cancelled.',
            data: {
                recurringBookingId: cancelled.id,
                isActive: cancelled.isActive
            }
        });
    }
    catch (error) {
        console.error('Error cancelling recurring booking:', error);
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('does not belong')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            if (error.message.includes('already cancelled')) {
                return res.status(400).json({ success: false, message: error.message });
            }
        }
        return res.status(500).json({ success: false, message: 'Failed to cancel recurring booking' });
    }
});
exports.cancelRecurringBookingHandler = cancelRecurringBookingHandler;
