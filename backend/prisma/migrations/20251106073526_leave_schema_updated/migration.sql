-- AlterTable
ALTER TABLE "TherapistLeave" ADD COLUMN     "casualRemaining" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "festiveRemaining" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "optionalRemaining" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sickRemaining" INTEGER NOT NULL DEFAULT 5;
