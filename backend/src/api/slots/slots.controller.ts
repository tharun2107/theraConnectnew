import type { Request, Response } from 'express';
import * as slotsService from './slots.service';
import prisma from '../../utils/prisma';
import { getAvailableSlotsSchema } from './slots.validation';
import z from 'zod';

export type getAvailableSlotsSchemaInput = z.infer<typeof getAvailableSlotsSchema>['body'];

export const getAvailableSlotsHandler = async (req: Request, res: Response) => {
  try {
    const { therapistId, date } = req.body as { therapistId: string; date: string };
    const availableSlots = await slotsService.generateAndGetAvailableSlots(therapistId, date);
    res.status(200).json(availableSlots);
  } catch (error: any) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const bookSlotHandler = async (req: Request, res: Response) => {
  try {
    const { timeSlotId, childId } = req.body;
    const parentProfile = await prisma.parentProfile.findUniqueOrThrow({
      where: { userId: req.user!.userId },
    });
    
    const booking = await slotsService.bookSlot(parentProfile.id, childId, timeSlotId);
    res.status(201).json({ message: 'Booking successful!', booking });
  } catch (error: any) {
    // A thrown error from the transaction often means a booking conflict
    res.status(409).json({ message: 'Failed to book slot. It may have been taken.' });
  }
};
