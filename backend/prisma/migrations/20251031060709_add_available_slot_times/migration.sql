-- AlterTable
ALTER TABLE "TherapistProfile" ADD COLUMN     "availableSlotTimes" TEXT[] DEFAULT ARRAY[]::TEXT[];
