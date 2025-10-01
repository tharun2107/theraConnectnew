import type { Request, Response } from 'express';
import * as adminService from './admin.service';

export const getAllTherapistsHandler = async (req: Request, res: Response) => {
    try {
        const therapists = await adminService.getAllTherapists();
        res.status(200).json(therapists);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve therapists' });
    }
};

export const updateTherapistStatusHandler = async (req: Request, res: Response) => {
    try {
        const { therapistId } = req.params;
        const { status } = req.body;
        const therapist = await adminService.updateTherapistStatus(therapistId, status);
        res.status(200).json(therapist);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update therapist status' });
    }
};