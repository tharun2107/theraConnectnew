import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { Role } from '@prisma/client'
import {
  getAvailableDemoSlotsHandler,
  createDemoBookingHandler,
  createDemoZoomMeetingHandler,
  getDemoBookingsHandler,
  updateDemoBookingNotesHandler,
  getAdminDemoSlotsHandler,
  createAdminDemoSlotsHandler,
  updateAdminDemoSlotsHandler,
  getDemoBookingHistoryHandler,
} from './demo.controller'

const router = Router()

// Public routes (no auth required for booking)
router.get('/slots', getAvailableDemoSlotsHandler)
router.post('/bookings', createDemoBookingHandler)

// Admin-only routes
router.use(authenticate, authorize([Role.ADMIN]))

// Demo slot management
router.get('/admin/slots', getAdminDemoSlotsHandler)
router.post('/admin/slots', createAdminDemoSlotsHandler)
router.put('/admin/slots/:month/:year', updateAdminDemoSlotsHandler)

// Demo booking management
router.get('/admin/bookings', getDemoBookingsHandler)
router.get('/admin/bookings/history', getDemoBookingHistoryHandler)
router.post('/admin/bookings/:bookingId/zoom', createDemoZoomMeetingHandler)
router.put('/admin/bookings/:bookingId/notes', updateDemoBookingNotesHandler)

export default router

