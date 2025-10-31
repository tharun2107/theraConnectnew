import type { Request, Response } from 'express';
import * as therapistService from './therapist.service';
import prisma from '../../utils/prisma';

const getTherapistId = async (userId: string) => {
    const profile = await prisma.therapistProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new Error('Therapist profile not found');
    return profile.id;
}

export const getMyProfileHandler = async (req: Request, res: Response) => {
    try {
        const profile = await therapistService.getTherapistProfile(req.user!.userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createTimeSlotsHandler = async (req: Request, res: Response) => {
    try {
        const therapistId = await getTherapistId(req.user!.userId);
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
    const therapistId = await getTherapistId(req.user!.userId);
    const result = await therapistService.requestLeave(therapistId, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMySlotsForDateHandler = async (req: Request, res: Response) => {
  try {
    const therapistId = await getTherapistId(req.user!.userId);
    const date = ((res.locals as any)?.validated?.query?.date ?? (req.query as any).date) as string;
    console.log('[getMySlotsForDate] therapistId=', therapistId, 'date=', date);
    const slots = await therapistService.getMySlotsForDate(therapistId, { date });
    res.status(200).json(slots);
  } catch (error: any) {
    console.error('[getMySlotsForDate][ERROR]', error);
    res.status(400).json({ message: error.message });
  }
};

export const checkHasActiveSlotsHandler = async (req: Request, res: Response) => {
  try {
    const therapistId = await getTherapistId(req.user!.userId);
    const hasActive = await therapistService.hasActiveSlots(therapistId);
    res.status(200).json({ hasActiveSlots: hasActive });
  } catch (error: any) {
    console.error('[checkHasActiveSlots][ERROR]', error);
    res.status(400).json({ message: error.message });
  }
};

export const setAvailableSlotTimesHandler = async (req: Request, res: Response) => {
  try {
    const therapistId = await getTherapistId(req.user!.userId);
    const { slotTimes } = req.body;
    const result = await therapistService.setAvailableSlotTimes(therapistId, slotTimes);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[setAvailableSlotTimes][ERROR]', error);
    res.status(400).json({ message: error.message });
  }
};