-- AlterTable
ALTER TABLE "TherapistProfile" ADD COLUMN     "selectedSlots" TEXT[] DEFAULT ARRAY[]::TEXT[];
