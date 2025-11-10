import { Router } from 'express'
import { therapyNotesController } from './therapy-notes.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

// ============================================
// THERAPIST ROUTES - Monthly Goals
// ============================================
router.get(
  '/therapist/monthly-goals',
  authenticate,
  therapyNotesController.getMonthlyGoals.bind(therapyNotesController)
)

router.put(
  '/therapist/monthly-goals',
  authenticate,
  therapyNotesController.updateMonthlyGoals.bind(therapyNotesController)
)

// ============================================
// THERAPIST ROUTES - Session Reports
// ============================================
router.post(
  '/therapist/session-report',
  authenticate,
  therapyNotesController.createSessionReport.bind(therapyNotesController)
)

router.get(
  '/therapist/session-report/:bookingId',
  authenticate,
  therapyNotesController.getSessionReport.bind(therapyNotesController)
)

router.get(
  '/therapist/session-reports/monthly',
  authenticate,
  therapyNotesController.getMonthlySessionReports.bind(therapyNotesController)
)

router.get(
  '/therapist/session-report/:bookingId/is-first',
  authenticate,
  therapyNotesController.checkIsFirstSession.bind(therapyNotesController)
)

// ============================================
// PARENT ROUTES - Task Management
// ============================================
router.put(
  '/parent/task/:taskId/completion',
  authenticate,
  therapyNotesController.updateTaskCompletion.bind(therapyNotesController)
)

router.put(
  '/parent/task/:taskId/observation',
  authenticate,
  therapyNotesController.updateTaskObservation.bind(therapyNotesController)
)

router.get(
  '/parent/tasks/pending',
  authenticate,
  therapyNotesController.getPendingTasks.bind(therapyNotesController)
)

router.get(
  '/parent/tasks/current-month',
  authenticate,
  therapyNotesController.getCurrentMonthTasks.bind(therapyNotesController)
)

router.get(
  '/therapist/tasks/current-month',
  authenticate,
  therapyNotesController.getCurrentMonthTasksForTherapist.bind(therapyNotesController)
)

// ============================================
// SHARED ROUTES
// ============================================
router.get(
  '/session-report/:bookingId',
  authenticate,
  therapyNotesController.getSessionReport.bind(therapyNotesController)
)

export default router

