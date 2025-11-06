import type { Request, Response } from 'express';
import * as therapistService from './therapist.service';
import prisma from '../../utils/prisma';
import { therapistScheduleService, ScheduleInput } from './therapist.service';

const getTherapistId = async (userId: string) => {
    const profile = await prisma.therapistProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new Error('Therapist profile not found');
    return profile.id;
}

export const getMyProfileHandler = async (req: Request, res: Response) => {
    try {
        const profile = await therapistService.getTherapistProfile(req.currentUser!.userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createTimeSlotsHandler = async (req: Request, res: Response) => {
    try {
        const therapistId = await getTherapistId(req.currentUser!.userId);
        console.log('[createTimeSlots] therapistId=', therapistId, 'body=', req.body);
        const result = await therapistService.createTimeSlots(therapistId, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('[createTimeSlots][ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};


export const requestLeaveHandler = async (req: Request, res: Response) => {
  try {
    const therapistId = await getTherapistId(req.currentUser!.userId);
    const result = await therapistService.requestLeave(therapistId, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMySlotsForDateHandler = async (req: Request, res: Response) => {
  try {
    const therapistId = await getTherapistId(req.currentUser!.userId);
    const date = ((res.locals as any)?.validated?.query?.date ?? (req.query as any).date) as string;
    console.log('[getMySlotsForDate] therapistId=', therapistId, 'date=', date);
    const slots = await therapistService.getMySlotsForDate(therapistId, { date });
    res.status(200).json(slots);
  } catch (error: any) {
    console.error('[getMySlotsForDate][ERROR]', error);
    res.status(400).json({ message: error.message });
  }
};

export const getTimeSlotOptionsHandler = async (req: Request, res: Response) => {
  try {
    const slotOptions = therapistScheduleService.generateAllTimeSlotOptions();

    return res.status(200).json({
      success: true,
      message: 'Available time slots retrieved successfully',
      data: {
        totalSlots: slotOptions.length,
        requiredSelection: 8,
        slotDuration: '60 minutes',
        slots: slotOptions
      }
    });
  } catch (error) {
    console.error('Error fetching time slot options:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve time slot options',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCurrentScheduleHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser!.userId;
    const scheduleData = await therapistScheduleService.getCurrentSchedule(userId);

    return res.status(200).json({
      success: true,
      message: 'Current schedule retrieved successfully',
      data: scheduleData
    });
  } catch (error) {
    console.error('Error fetching current schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve current schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const setScheduleHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser!.userId;
    const scheduleData: ScheduleInput = req.body;

    // Set the permanent schedule and generate future slots
    const updatedProfile = await therapistScheduleService.setPermanentSchedule(
      userId,
      scheduleData
    );

    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully.',
      data: {
        selectedSlots: updatedProfile.selectedSlots,
        slotDurationInMinutes: updatedProfile.slotDurationInMinutes,
        maxSlotsPerDay: updatedProfile.maxSlotsPerDay,
      }
    });
  } catch (error) {
    console.error('Error setting schedule:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('must select exactly')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('Duplicate')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to set schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateScheduleHandler = async (req: Request, res: Response) => {
  // Use the same logic as setScheduleHandler
  return setScheduleHandler(req, res);
};