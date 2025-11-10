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
exports.updateAdminDemoSlotsHandler = exports.createAdminDemoSlotsHandler = exports.getAdminDemoSlotsHandler = exports.updateDemoBookingNotesHandler = exports.getDemoBookingHistoryHandler = exports.getDemoBookingsHandler = exports.createDemoZoomMeetingHandler = exports.createDemoBookingHandler = exports.getAvailableDemoSlotsHandler = void 0;
const demoService = __importStar(require("./demo.service"));
const zoom_service_1 = require("../../services/zoom.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
// Get available demo slots (public)
const getAvailableDemoSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timezone, date } = req.query; // User's timezone and optional date filter
        const slots = yield demoService.getAvailableDemoSlots(timezone, date);
        res.status(200).json(slots);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve demo slots' });
    }
});
exports.getAvailableDemoSlotsHandler = getAvailableDemoSlotsHandler;
// Helper function to convert 24-hour time to 12-hour with AM/PM
function formatTime12Hour(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
// Helper function to convert admin time to user timezone with AM/PM
function convertTimeToUserTimezone(adminTime, slotDate, userTimezone) {
    if (!userTimezone) {
        return formatTime12Hour(adminTime);
    }
    const adminTimezone = process.env.ADMIN_TIMEZONE || 'Asia/Kolkata';
    try {
        const [adminHours, adminMinutes] = adminTime.split(':').map(Number);
        const [year, month, day] = slotDate.split('-').map(Number);
        // Calculate timezone offset
        const testUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        const adminNoonStr = new Intl.DateTimeFormat('en-US', {
            timeZone: adminTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(testUTC);
        const [adminNoonH, adminNoonM] = adminNoonStr.split(':').map(Number);
        const adminNoonMinutes = adminNoonH * 60 + adminNoonM;
        const utcNoonMinutes = 12 * 60;
        const adminOffsetMinutes = adminNoonMinutes - utcNoonMinutes;
        const userNoonStr = new Intl.DateTimeFormat('en-US', {
            timeZone: userTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(testUTC);
        const [userNoonH, userNoonM] = userNoonStr.split(':').map(Number);
        const userNoonMinutes = userNoonH * 60 + userNoonM;
        const userOffsetMinutes = userNoonMinutes - utcNoonMinutes;
        const offsetDiff = userOffsetMinutes - adminOffsetMinutes;
        const adminTimeMinutes = adminHours * 60 + adminMinutes;
        const userTimeMinutes = (adminTimeMinutes + offsetDiff + 1440) % 1440;
        const userHours = Math.floor(userTimeMinutes / 60);
        const userMinutes = userTimeMinutes % 60;
        const userTime24 = `${String(userHours).padStart(2, '0')}:${String(userMinutes).padStart(2, '0')}`;
        return formatTime12Hour(userTime24);
    }
    catch (e) {
        return formatTime12Hour(adminTime);
    }
}
// Create demo booking (public)
const createDemoBookingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile, email, reason, slotDate, slotHour, slotTimeString, userTimezone } = req.body;
        // Validate required fields
        if (!name || !mobile || !email || !reason || !slotDate || slotHour === undefined || !slotTimeString) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const booking = yield demoService.createDemoBooking({
            name,
            mobile,
            email,
            reason,
            slotDate,
            slotHour,
            slotTimeString,
        });
        // Convert time to user's timezone for email
        const userTime = convertTimeToUserTimezone(booking.slotTimeString, slotDate, userTimezone);
        // Send confirmation email to user
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Demo Session Confirmed - Therabee</h2>
        <p>Dear ${name},</p>
        <p>Thank you for booking a demo session with Therabee!</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Demo Session Details:</h3>
          <p><strong>Date:</strong> ${new Date(slotDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${userTime} ${userTimezone ? `(${userTimezone})` : ''}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>We will send you a Zoom link closer to your scheduled time.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Therabee Team</p>
      </div>
    `;
        // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
        // await sendemail(email, 'Demo Session Confirmation', emailHtml, 'Demo Session Confirmation - Therabee')
        // Send notification email to admin
        // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
        // const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
        // if (adminEmail) {
        //   const adminEmailHtml = `
        //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //       <h2 style="color: #4F46E5;">New Demo Booking - Therabee</h2>
        //       <p>A new demo session has been booked:</p>
        //       <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        //         <h3 style="margin-top: 0;">Booking Details:</h3>
        //         <p><strong>Name:</strong> ${name}</p>
        //         <p><strong>Email:</strong> ${email}</p>
        //         <p><strong>Mobile:</strong> ${mobile}</p>
        //         <p><strong>Date:</strong> ${new Date(slotDate).toLocaleDateString()}</p>
        //         <p><strong>Time:</strong> ${formatTime12Hour(slotTimeString)}</p>
        //         <p><strong>Reason:</strong> ${reason}</p>
        //       </div>
        //       <p>Please log in to the admin dashboard to manage this booking.</p>
        //     </div>
        //   `
        //   await sendemail(adminEmail, 'New Demo Booking', adminEmailHtml, 'New Demo Booking - Therabee')
        // }
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create demo booking' });
    }
});
exports.createDemoBookingHandler = createDemoBookingHandler;
// Create Zoom meeting for demo booking (admin only)
const createDemoZoomMeetingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield demoService.getDemoBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Demo booking not found' });
        }
        if (booking.meetingId) {
            return res.status(200).json({
                meetingId: booking.meetingId,
                password: booking.meetingPassword,
                zoomLink: booking.zoomLink,
            });
        }
        // Create Zoom meeting in admin's timezone
        const adminTimezone = process.env.ADMIN_TIMEZONE || 'Asia/Kolkata';
        const slotDate = new Date(booking.slotDate);
        // Get the original slot time from demoSlot
        const demoSlot = yield prisma_1.default.demoSlot.findUnique({
            where: { id: booking.demoSlotId || '' },
        });
        if (!demoSlot) {
            return res.status(404).json({ message: 'Demo slot not found' });
        }
        // Parse admin's time string (e.g., "13:00" for 1pm)
        const [adminHours, adminMinutes] = demoSlot.timeString.split(':').map(Number);
        // Create date-time in admin's timezone
        const slotDateTime = new Date(Date.UTC(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), adminHours, adminMinutes, 0));
        // Adjust to admin's timezone
        const adminLocal = new Date(slotDateTime.toLocaleString('en-US', { timeZone: adminTimezone }));
        const utcDate = new Date(slotDateTime.toLocaleString('en-US', { timeZone: 'UTC' }));
        const offset = adminLocal.getTime() - utcDate.getTime();
        const finalDateTime = new Date(slotDateTime.getTime() - offset);
        const meeting = yield (0, zoom_service_1.createRealMeeting)({
            topic: `Therabee Demo Session - ${booking.name}`,
            startTimeIso: finalDateTime.toISOString(),
            durationMinutes: 60, // 1 hour demo
        });
        // Update booking with meeting details
        const updated = yield demoService.updateDemoBookingZoomDetails(bookingId, {
            meetingId: meeting.meetingId,
            meetingPassword: meeting.password,
            zoomLink: meeting.joinUrl,
        });
        // Convert time to user's timezone for email (we'll try to detect from booking or use admin time)
        // Since we don't store user timezone, we'll convert admin time to common timezones or use admin time
        // For now, we'll show admin time with AM/PM - ideally we'd store user timezone in booking
        const userTime = formatTime12Hour(booking.slotTimeString);
        const slotDateStr = booking.slotDate.toISOString().split('T')[0];
        // Send Zoom link email to user
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Your Demo Session Zoom Link - Therabee</h2>
        <p>Dear ${booking.name},</p>
        <p>Your demo session with Therabee is ready!</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details:</h3>
          <p><strong>Date:</strong> ${new Date(booking.slotDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${userTime}</p>
          <p><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
          <p><strong>Password:</strong> ${meeting.password}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meeting.joinUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Join Demo Session
          </a>
        </div>
        <p>Click the button above or use this link: <a href="${meeting.joinUrl}">${meeting.joinUrl}</a></p>
        <p>Best regards,<br>Therabee Team</p>
      </div>
    `;
        // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
        // await sendemail(booking.email, 'Your Demo Session Zoom Link', emailHtml, 'Your Demo Session Zoom Link - Therabee')
        res.status(201).json({
            meetingId: updated.meetingId,
            password: updated.meetingPassword,
            zoomLink: updated.zoomLink,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create Zoom meeting' });
    }
});
exports.createDemoZoomMeetingHandler = createDemoZoomMeetingHandler;
// Get all demo bookings (admin only)
const getDemoBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield demoService.getAllDemoBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve demo bookings' });
    }
});
exports.getDemoBookingsHandler = getDemoBookingsHandler;
// Get demo booking history (admin only)
const getDemoBookingHistoryHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield demoService.getDemoBookingHistory();
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve demo booking history' });
    }
});
exports.getDemoBookingHistoryHandler = getDemoBookingHistoryHandler;
// Update demo booking notes (admin only)
const updateDemoBookingNotesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const { userQuery, converted, additionalNotes } = req.body;
        const booking = yield demoService.updateDemoBookingNotes(bookingId, {
            userQuery,
            converted,
            additionalNotes,
        });
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update demo booking notes' });
    }
});
exports.updateDemoBookingNotesHandler = updateDemoBookingNotesHandler;
// Get admin demo slots (admin only)
const getAdminDemoSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year } = req.query;
        const slots = yield demoService.getAdminDemoSlots(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
        res.status(200).json(slots);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to retrieve demo slots' });
    }
});
exports.getAdminDemoSlotsHandler = getAdminDemoSlotsHandler;
// Create admin demo slots (admin only)
const createAdminDemoSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year, slotTimes } = req.body; // slotTimes: string[] e.g., ["09:00", "14:00", ...] (8 slots)
        if (!slotTimes || slotTimes.length !== 8) {
            return res.status(400).json({ message: 'Exactly 8 slot times are required' });
        }
        const slots = yield demoService.createAdminDemoSlots(month, year, slotTimes);
        res.status(201).json(slots);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create demo slots' });
    }
});
exports.createAdminDemoSlotsHandler = createAdminDemoSlotsHandler;
// Update admin demo slots (admin only)
const updateAdminDemoSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year } = req.params;
        const { slotTimes } = req.body;
        if (!slotTimes || slotTimes.length !== 8) {
            return res.status(400).json({ message: 'Exactly 8 slot times are required' });
        }
        const slots = yield demoService.updateAdminDemoSlots(parseInt(month), parseInt(year), slotTimes);
        res.status(200).json(slots);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update demo slots' });
    }
});
exports.updateAdminDemoSlotsHandler = updateAdminDemoSlotsHandler;
