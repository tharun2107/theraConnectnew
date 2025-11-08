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

export const getTherapistSessionsHandler = async (req: Request, res: Response) => {
    try {
        const { therapistId } = req.params;
        const sessions = await adminService.getTherapistSessions(therapistId);
        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve therapist sessions' });
    }
};

export const getAllChildrenHandler = async (req: Request, res: Response) => {
    try {
        const children = await adminService.getAllChildren();
        res.status(200).json(children);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve children' });
    }
};

export const getChildSessionsHandler = async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;
        const sessions = await adminService.getChildSessions(childId);
        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve child sessions' });
    }
};

export const getAllBookingsHandler = async (req: Request, res: Response) => {
    try {
        const bookings = await adminService.getAllBookings();
        res.status(200).json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve bookings' });
    }
};

export const getProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = await adminService.getProfile(userId);
        res.status(200).json(profile);
    } catch (error: any) {
        if (error.message === 'Admin profile not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error('[admin.controller.getProfileHandler] Error:', error);
        res.status(500).json({ message: error.message || 'Failed to retrieve profile' });
    }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = await adminService.updateProfile(userId, req.body);
        res.status(200).json(profile);
    } catch (error: any) {
        console.error('[admin.controller.updateProfileHandler] Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};

export const getPlatformSettingsHandler = async (req: Request, res: Response) => {
    try {
        const settings = await adminService.getPlatformSettings();
        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve platform settings' });
    }
};

export const updatePlatformSettingsHandler = async (req: Request, res: Response) => {
    try {
        const settings = await adminService.updatePlatformSettings(req.body);
        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update platform settings' });
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

export const listLeaveRequestsHandler = async (req: Request, res: Response) => {
  try {
    const leaves = await adminService.listLeaveRequests();
    res.status(200).json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve leave requests' });
  }
};

export const approveLeaveRequestHandler = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params as any;
    const result = await adminService.approveLeaveRequest(leaveId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to approve leave request' });
  }
};

export const rejectLeaveRequestHandler = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params as any;
    const { reason } = req.body as any;
    const result = await adminService.rejectLeaveRequest(leaveId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to reject leave request' });
  }
};