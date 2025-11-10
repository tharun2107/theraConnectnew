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
Object.defineProperty(exports, "__esModule", { value: true });
exports.therapyNotesService = exports.TherapyNotesService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TherapyNotesService {
    // ============================================
    // MONTHLY GOALS
    // ============================================
    /**
     * Get or create monthly goals for a child-therapist pair
     */
    getMonthlyGoals(therapistId, childId, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let goals = yield prisma.monthlyGoal.findUnique({
                where: {
                    therapistId_childId_month_year: {
                        therapistId,
                        childId,
                        month,
                        year
                    }
                },
                include: {
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            if (!goals) {
                goals = yield prisma.monthlyGoal.create({
                    data: {
                        therapistId,
                        childId,
                        month,
                        year,
                        goals: []
                    },
                    include: {
                        child: {
                            select: {
                                name: true,
                                age: true
                            }
                        },
                        therapist: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
            }
            return goals;
        });
    }
    /**
     * Update monthly goals (only on first session of month)
     */
    updateMonthlyGoals(therapistId, childId, month, year, goals) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.monthlyGoal.upsert({
                where: {
                    therapistId_childId_month_year: {
                        therapistId,
                        childId,
                        month,
                        year
                    }
                },
                update: {
                    goals
                },
                create: {
                    therapistId,
                    childId,
                    month,
                    year,
                    goals
                },
                include: {
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        });
    }
    // ============================================
    // SESSION REPORTS
    // ============================================
    /**
     * Create or update session report after session completion
     */
    createSessionReport(bookingId, therapistId, childId, sessionDetails, tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if report already exists
            const existing = yield prisma.sessionReport.findUnique({
                where: { bookingId }
            });
            if (existing) {
                // Update existing report
                return yield prisma.sessionReport.update({
                    where: { bookingId },
                    data: {
                        sessionDetails,
                        tasks: {
                            deleteMany: {}, // Remove old tasks
                            create: tasks // Create new tasks
                        }
                    },
                    include: {
                        tasks: true,
                        booking: {
                            include: {
                                timeSlot: true
                            }
                        },
                        child: {
                            select: {
                                name: true,
                                age: true
                            }
                        },
                        therapist: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
            }
            // Create new report
            return yield prisma.sessionReport.create({
                data: {
                    bookingId,
                    therapistId,
                    childId,
                    sessionDetails,
                    tasks: {
                        create: tasks
                    }
                },
                include: {
                    tasks: true,
                    booking: {
                        include: {
                            timeSlot: true
                        }
                    },
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Get session report by booking ID
     */
    getSessionReport(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.sessionReport.findUnique({
                where: { bookingId },
                include: {
                    tasks: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    booking: {
                        include: {
                            timeSlot: true,
                            child: true,
                            parent: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    },
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Get all session reports for a child in a specific month
     */
    getMonthlySessionReports(childId, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            return yield prisma.sessionReport.findMany({
                where: {
                    childId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    tasks: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    booking: {
                        include: {
                            timeSlot: true
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
        });
    }
    /**
     * Check if this is the first session of the month for a child-therapist pair
     */
    isFirstSessionOfMonth(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    timeSlot: true
                }
            });
            if (!booking)
                return false;
            const sessionDate = booking.timeSlot.startTime;
            const month = sessionDate.getMonth() + 1;
            const year = sessionDate.getFullYear();
            // Check if there are any previous sessions in this month
            const previousSessions = yield prisma.sessionReport.findMany({
                where: {
                    therapistId: booking.therapistId,
                    childId: booking.childId,
                    booking: {
                        timeSlot: {
                            startTime: {
                                gte: new Date(year, month - 1, 1),
                                lt: sessionDate
                            }
                        }
                    }
                }
            });
            return previousSessions.length === 0;
        });
    }
    // ============================================
    // PARENT TASK UPDATES
    // ============================================
    /**
     * Parent updates task completion status
     */
    updateTaskCompletion(taskId, isDone) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.sessionTask.update({
                where: { id: taskId },
                data: { isDone }
            });
        });
    }
    /**
     * Parent adds observation to a task
     */
    updateTaskObservation(taskId, observation) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.sessionTask.update({
                where: { id: taskId },
                data: { observation }
            });
        });
    }
    /**
     * Get all pending tasks for a parent (tasks not marked as done/not done)
     */
    getPendingTasksForParent(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.sessionTask.findMany({
                where: {
                    isDone: null,
                    sessionReport: {
                        booking: {
                            parentId
                        }
                    }
                },
                include: {
                    sessionReport: {
                        include: {
                            booking: {
                                include: {
                                    timeSlot: true,
                                    child: true,
                                    therapist: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    }
    /**
     * Get all tasks for current month sessions for a parent
     */
    getCurrentMonthTasksForParent(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            return yield prisma.sessionReport.findMany({
                where: {
                    booking: {
                        parentId,
                        timeSlot: {
                            startTime: {
                                gte: startOfMonth,
                                lte: endOfMonth
                            }
                        },
                        isCompleted: true
                    }
                },
                include: {
                    tasks: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    booking: {
                        include: {
                            timeSlot: true,
                            child: true,
                            therapist: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    },
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
        });
    }
    /**
     * Get all tasks for current month sessions for a therapist
     */
    getCurrentMonthTasksForTherapist(therapistId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            return yield prisma.sessionReport.findMany({
                where: {
                    therapistId,
                    booking: {
                        timeSlot: {
                            startTime: {
                                gte: startOfMonth,
                                lte: endOfMonth
                            }
                        },
                        isCompleted: true
                    }
                },
                include: {
                    tasks: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    booking: {
                        include: {
                            timeSlot: true,
                            child: true,
                            parent: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    therapist: {
                        select: {
                            name: true
                        }
                    },
                    child: {
                        select: {
                            name: true,
                            age: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
        });
    }
}
exports.TherapyNotesService = TherapyNotesService;
exports.therapyNotesService = new TherapyNotesService();
