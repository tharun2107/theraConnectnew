"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const therapy_notes_controller_1 = require("./therapy-notes.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ============================================
// THERAPIST ROUTES - Monthly Goals
// ============================================
router.get('/therapist/monthly-goals', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getMonthlyGoals.bind(therapy_notes_controller_1.therapyNotesController));
router.put('/therapist/monthly-goals', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.updateMonthlyGoals.bind(therapy_notes_controller_1.therapyNotesController));
// ============================================
// THERAPIST ROUTES - Session Reports
// ============================================
router.post('/therapist/session-report', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.createSessionReport.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/therapist/session-report/:bookingId', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getSessionReport.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/therapist/session-reports/monthly', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getMonthlySessionReports.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/therapist/session-report/:bookingId/is-first', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.checkIsFirstSession.bind(therapy_notes_controller_1.therapyNotesController));
// ============================================
// PARENT ROUTES - Task Management
// ============================================
router.put('/parent/task/:taskId/completion', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.updateTaskCompletion.bind(therapy_notes_controller_1.therapyNotesController));
router.put('/parent/task/:taskId/observation', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.updateTaskObservation.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/parent/tasks/pending', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getPendingTasks.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/parent/tasks/current-month', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getCurrentMonthTasks.bind(therapy_notes_controller_1.therapyNotesController));
router.get('/therapist/tasks/current-month', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getCurrentMonthTasksForTherapist.bind(therapy_notes_controller_1.therapyNotesController));
// ============================================
// SHARED ROUTES
// ============================================
router.get('/session-report/:bookingId', auth_middleware_1.authenticate, therapy_notes_controller_1.therapyNotesController.getSessionReport.bind(therapy_notes_controller_1.therapyNotesController));
exports.default = router;
