import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { childSchema } from './parent.validation';

const prisma = new PrismaClient();
type ChildInput = z.infer<typeof childSchema>['body'];

export const getParentProfile = async (userId: string) => {
    return prisma.parentProfile.findUnique({ where: { userId } });
};

export const getChildren = async (parentId: string) => {
    return prisma.child.findMany({ where: { parentId } });
};

export const addChild = async (parentId: string, input: ChildInput) => {
    return prisma.child.create({
        data: { ...input, parentId },
    });
};

export const updateChild = async (childId: string, parentId: string, input: Partial<ChildInput>) => {
    return prisma.child.update({
        where: { id: childId, parentId }, // Ensures a parent can only update their own child
        data: input,
    });
};

export const deleteChild = async (childId: string, parentId: string) => {
    return prisma.child.delete({
        where: { id: childId, parentId },
    });
};

export const listActiveTherapists = async () => {
    return prisma.therapistProfile.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            specialization: true,
            experience: true,
            baseCostPerSession: true,
            averageRating: true,
        },
        orderBy: { name: 'asc' },
    });
};