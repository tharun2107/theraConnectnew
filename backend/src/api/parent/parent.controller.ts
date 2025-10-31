import type { Request, Response } from 'express';
import * as parentService from './parent.service';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';

const getParentId = async (userId: string) => {
    const parentProfile = await prisma.parentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!parentProfile) throw new Error('Parent profile not found');
    return parentProfile.id;
}

export const getMyProfileHandler = async (req: Request, res: Response) => {
    try {
        const profile = await parentService.getParentProfile(req.user!.userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
}

export const updateMyProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        console.log('[PARENT][UPDATE_PROFILE]', userId, req.body)
        const updated = await parentService.updateParentProfile(userId, req.body);
        res.status(200).json(updated);
    } catch (error: any) {
        console.error('[PARENT][UPDATE_PROFILE][ERROR]', error?.message || error)
        const status = /unique|constraint/i.test(error?.message) ? 409 : 500;
        res.status(status).json({ message: error.message || 'Failed to update profile' });
    }
}

export const getMyChildrenHandler = async (req: Request, res: Response) => {
    try {
        const parentId = await getParentId(req.user!.userId);
        const children = await parentService.getChildren(parentId);
        res.status(200).json(children);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
}

export const addChildHandler = async (req: Request, res: Response) => {
  try {
    const parentId = await getParentId(req.user!.userId);
    const child = await parentService.addChild(parentId, req.body);
    res.status(201).json(child);
  } catch (error: any) {
    // Check for Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          message: 'Duplicate child detected. You cannot add the same child twice.',
          fields: error.meta?.target, // optional: shows which field caused the violation
        });
      }
    }

    // fallback for other errors
    res.status(500).json({ message: 'Failed to add child' });
  }
};

export const updateChildHandler = async (req: Request, res: Response) => {
    try {
        const parentId = await getParentId(req.user!.userId);
        const { childId } = req.params;
        const child = await parentService.updateChild(childId, parentId, req.body);
        res.status(200).json(child);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update child' });
    }
}

export const deleteChildHandler = async (req: Request, res: Response) => {
    try {
        const parentId = await getParentId(req.user!.userId);
        const { childId } = req.params;
        await parentService.deleteChild(childId, parentId);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete child' });
    }
}

export const getActiveTherapistsHandler = async (req: Request, res: Response) => {
    try {
        const therapists = await parentService.listActiveTherapists();
        res.status(200).json(therapists);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve active therapists' });
    }
}