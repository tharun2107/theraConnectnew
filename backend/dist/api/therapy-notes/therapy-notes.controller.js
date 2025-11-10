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
exports.therapyNotesController = exports.TherapyNotesController = void 0;
const therapy_notes_service_1 = require("./therapy-notes.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
// Helper function to get therapist profile ID from user ID
const getTherapistId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.therapistProfile.findUnique({
        where: { userId },
        select: { id: true }
    });
    if (!profile)
        throw new Error('Therapist profile not found');
    return profile.id;
});
// Helper function to get parent profile ID from user ID
const getParentId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parentProfile = yield prisma_1.default.parentProfile.findUnique({
        where: { userId },
        select: { id: true }
    });
    if (!parentProfile)
        throw new Error('Parent profile not found');
    return parentProfile.id;
});
class TherapyNotesController {
    // ============================================
    // MONTHLY GOALS - Therapist
    // ============================================
    getMonthlyGoals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const therapistId = yield getTherapistId(req.user.userId);
                const { childId, month, year } = req.query;
                if (!childId || !month || !year) {
                    return res.status(400).json({
                        success: false,
                        message: 'childId, month, and year are required'
                    });
                }
                const goals = yield therapy_notes_service_1.therapyNotesService.getMonthlyGoals(therapistId, childId, parseInt(month), parseInt(year));
                return res.json({
                    success: true,
                    data: goals
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getMonthlyGoals error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch monthly goals'
                });
            }
        });
    }
    updateMonthlyGoals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const therapistId = yield getTherapistId(req.user.userId);
                const { childId, month, year, goals } = req.body;
                if (!childId || !month || !year || !goals) {
                    return res.status(400).json({
                        success: false,
                        message: 'childId, month, year, and goals are required'
                    });
                }
                const updatedGoals = yield therapy_notes_service_1.therapyNotesService.updateMonthlyGoals(therapistId, childId, month, year, goals);
                return res.json({
                    success: true,
                    data: updatedGoals
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] updateMonthlyGoals error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to update monthly goals'
                });
            }
        });
    }
    // ============================================
    // SESSION REPORTS - Therapist
    // ============================================
    createSessionReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const therapistId = yield getTherapistId(req.user.userId);
                const { bookingId, childId, sessionDetails, tasks } = req.body;
                console.log('[TherapyNotesController] createSessionReport:', {
                    therapistId,
                    bookingId,
                    childId,
                    sessionDetails,
                    tasks
                });
                if (!bookingId || !childId || !sessionDetails || !tasks) {
                    return res.status(400).json({
                        success: false,
                        message: 'bookingId, childId, sessionDetails, and tasks are required'
                    });
                }
                const report = yield therapy_notes_service_1.therapyNotesService.createSessionReport(bookingId, therapistId, childId, sessionDetails, tasks);
                return res.json({
                    success: true,
                    data: report
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] createSessionReport error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to create session report'
                });
            }
        });
    }
    getSessionReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.params;
                const report = yield therapy_notes_service_1.therapyNotesService.getSessionReport(bookingId);
                if (!report) {
                    return res.status(404).json({
                        success: false,
                        message: 'Session report not found'
                    });
                }
                return res.json({
                    success: true,
                    data: report
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getSessionReport error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch session report'
                });
            }
        });
    }
    getMonthlySessionReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { childId, month, year } = req.query;
                if (!childId || !month || !year) {
                    return res.status(400).json({
                        success: false,
                        message: 'childId, month, and year are required'
                    });
                }
                const reports = yield therapy_notes_service_1.therapyNotesService.getMonthlySessionReports(childId, parseInt(month), parseInt(year));
                return res.json({
                    success: true,
                    data: reports
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getMonthlySessionReports error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch monthly session reports'
                });
            }
        });
    }
    checkIsFirstSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.params;
                const isFirst = yield therapy_notes_service_1.therapyNotesService.isFirstSessionOfMonth(bookingId);
                return res.json({
                    success: true,
                    data: { isFirstSession: isFirst }
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] checkIsFirstSession error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to check first session'
                });
            }
        });
    }
    // ============================================
    // PARENT TASK UPDATES
    // ============================================
    updateTaskCompletion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId } = req.params;
                const { isDone } = req.body;
                if (typeof isDone !== 'boolean') {
                    return res.status(400).json({
                        success: false,
                        message: 'isDone must be a boolean'
                    });
                }
                const task = yield therapy_notes_service_1.therapyNotesService.updateTaskCompletion(taskId, isDone);
                return res.json({
                    success: true,
                    data: task
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] updateTaskCompletion error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to update task completion'
                });
            }
        });
    }
    updateTaskObservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId } = req.params;
                const { observation } = req.body;
                if (!observation) {
                    return res.status(400).json({
                        success: false,
                        message: 'observation is required'
                    });
                }
                const task = yield therapy_notes_service_1.therapyNotesService.updateTaskObservation(taskId, observation);
                return res.json({
                    success: true,
                    data: task
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] updateTaskObservation error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to update task observation'
                });
            }
        });
    }
    getPendingTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parentId = yield getParentId(req.user.userId);
                const tasks = yield therapy_notes_service_1.therapyNotesService.getPendingTasksForParent(parentId);
                return res.json({
                    success: true,
                    data: tasks
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getPendingTasks error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch pending tasks'
                });
            }
        });
    }
    getCurrentMonthTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parentId = yield getParentId(req.user.userId);
                const reports = yield therapy_notes_service_1.therapyNotesService.getCurrentMonthTasksForParent(parentId);
                return res.json({
                    success: true,
                    data: reports
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getCurrentMonthTasks error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch current month tasks'
                });
            }
        });
    }
    getCurrentMonthTasksForTherapist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const therapistId = yield getTherapistId(req.user.userId);
                const reports = yield therapy_notes_service_1.therapyNotesService.getCurrentMonthTasksForTherapist(therapistId);
                return res.json({
                    success: true,
                    data: reports
                });
            }
            catch (error) {
                console.error('[TherapyNotesController] getCurrentMonthTasksForTherapist error:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch current month tasks'
                });
            }
        });
    }
}
exports.TherapyNotesController = TherapyNotesController;
exports.therapyNotesController = new TherapyNotesController();
