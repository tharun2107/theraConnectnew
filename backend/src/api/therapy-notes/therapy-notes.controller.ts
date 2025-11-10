import { Request, Response } from 'express'
import { therapyNotesService } from './therapy-notes.service'
import prisma from '../../utils/prisma'

// Helper function to get therapist profile ID from user ID
const getTherapistId = async (userId: string) => {
  const profile = await prisma.therapistProfile.findUnique({ 
    where: { userId }, 
    select: { id: true } 
  })
  if (!profile) throw new Error('Therapist profile not found')
  return profile.id
}

// Helper function to get parent profile ID from user ID
const getParentId = async (userId: string) => {
  const parentProfile = await prisma.parentProfile.findUnique({ 
    where: { userId }, 
    select: { id: true } 
  })
  if (!parentProfile) throw new Error('Parent profile not found')
  return parentProfile.id
}

export class TherapyNotesController {
  // ============================================
  // MONTHLY GOALS - Therapist
  // ============================================

  async getMonthlyGoals(req: Request, res: Response) {
    try {
      const therapistId = await getTherapistId(req.user!.userId)
      const { childId, month, year } = req.query

      if (!childId || !month || !year) {
        return res.status(400).json({
          success: false,
          message: 'childId, month, and year are required'
        })
      }

      const goals = await therapyNotesService.getMonthlyGoals(
        therapistId,
        childId as string,
        parseInt(month as string),
        parseInt(year as string)
      )

      return res.json({
        success: true,
        data: goals
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getMonthlyGoals error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch monthly goals'
      })
    }
  }

  async updateMonthlyGoals(req: Request, res: Response) {
    try {
      const therapistId = await getTherapistId(req.user!.userId)
      const { childId, month, year, goals } = req.body

      if (!childId || !month || !year || !goals) {
        return res.status(400).json({
          success: false,
          message: 'childId, month, year, and goals are required'
        })
      }

      const updatedGoals = await therapyNotesService.updateMonthlyGoals(
        therapistId,
        childId,
        month,
        year,
        goals
      )

      return res.json({
        success: true,
        data: updatedGoals
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] updateMonthlyGoals error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update monthly goals'
      })
    }
  }

  // ============================================
  // SESSION REPORTS - Therapist
  // ============================================

  async createSessionReport(req: Request, res: Response) {
    try {
      const therapistId = await getTherapistId(req.user!.userId)
      const { bookingId, childId, sessionDetails, tasks } = req.body

      console.log('[TherapyNotesController] createSessionReport:', {
        therapistId,
        bookingId,
        childId,
        sessionDetails,
        tasks
      })

      if (!bookingId || !childId || !sessionDetails || !tasks) {
        return res.status(400).json({
          success: false,
          message: 'bookingId, childId, sessionDetails, and tasks are required'
        })
      }

      const report = await therapyNotesService.createSessionReport(
        bookingId,
        therapistId,
        childId,
        sessionDetails,
        tasks
      )

      return res.json({
        success: true,
        data: report
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] createSessionReport error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create session report'
      })
    }
  }

  async getSessionReport(req: Request, res: Response) {
    try {
      const { bookingId } = req.params

      const report = await therapyNotesService.getSessionReport(bookingId)

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Session report not found'
        })
      }

      return res.json({
        success: true,
        data: report
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getSessionReport error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch session report'
      })
    }
  }

  async getMonthlySessionReports(req: Request, res: Response) {
    try {
      const { childId, month, year } = req.query

      if (!childId || !month || !year) {
        return res.status(400).json({
          success: false,
          message: 'childId, month, and year are required'
        })
      }

      const reports = await therapyNotesService.getMonthlySessionReports(
        childId as string,
        parseInt(month as string),
        parseInt(year as string)
      )

      return res.json({
        success: true,
        data: reports
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getMonthlySessionReports error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch monthly session reports'
      })
    }
  }

  async checkIsFirstSession(req: Request, res: Response) {
    try {
      const { bookingId } = req.params

      const isFirst = await therapyNotesService.isFirstSessionOfMonth(bookingId)

      return res.json({
        success: true,
        data: { isFirstSession: isFirst }
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] checkIsFirstSession error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to check first session'
      })
    }
  }

  // ============================================
  // PARENT TASK UPDATES
  // ============================================

  async updateTaskCompletion(req: Request, res: Response) {
    try {
      const { taskId } = req.params
      const { isDone } = req.body

      if (typeof isDone !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isDone must be a boolean'
        })
      }

      const task = await therapyNotesService.updateTaskCompletion(taskId, isDone)

      return res.json({
        success: true,
        data: task
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] updateTaskCompletion error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task completion'
      })
    }
  }

  async updateTaskObservation(req: Request, res: Response) {
    try {
      const { taskId } = req.params
      const { observation } = req.body

      if (!observation) {
        return res.status(400).json({
          success: false,
          message: 'observation is required'
        })
      }

      const task = await therapyNotesService.updateTaskObservation(taskId, observation)

      return res.json({
        success: true,
        data: task
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] updateTaskObservation error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task observation'
      })
    }
  }

  async getPendingTasks(req: Request, res: Response) {
    try {
      const parentId = await getParentId(req.user!.userId)

      const tasks = await therapyNotesService.getPendingTasksForParent(parentId)

      return res.json({
        success: true,
        data: tasks
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getPendingTasks error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending tasks'
      })
    }
  }

  async getCurrentMonthTasks(req: Request, res: Response) {
    try {
      const parentId = await getParentId(req.user!.userId)

      const reports = await therapyNotesService.getCurrentMonthTasksForParent(parentId)

      return res.json({
        success: true,
        data: reports
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getCurrentMonthTasks error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch current month tasks'
      })
    }
  }

  async getCurrentMonthTasksForTherapist(req: Request, res: Response) {
    try {
      const therapistId = await getTherapistId(req.user!.userId)

      const reports = await therapyNotesService.getCurrentMonthTasksForTherapist(therapistId)

      return res.json({
        success: true,
        data: reports
      })
    } catch (error: any) {
      console.error('[TherapyNotesController] getCurrentMonthTasksForTherapist error:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch current month tasks'
      })
    }
  }
}

export const therapyNotesController = new TherapyNotesController()

