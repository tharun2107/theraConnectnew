/*
  Warnings:

  - The values [FULL_DAY] on the enum `LeaveType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isApproved` on the `TherapistLeave` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('DAILY', 'WEEKLY');

-- AlterEnum
BEGIN;
CREATE TYPE "LeaveType_new" AS ENUM ('CASUAL', 'SICK', 'FESTIVE', 'OPTIONAL');
ALTER TABLE "TherapistLeave" ALTER COLUMN "type" TYPE "LeaveType_new" USING ("type"::text::"LeaveType_new");
ALTER TYPE "LeaveType" RENAME TO "LeaveType_old";
ALTER TYPE "LeaveType_new" RENAME TO "LeaveType";
DROP TYPE "public"."LeaveType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LEAVE_REQUEST_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'LEAVE_REQUEST_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'LEAVE_REQUEST_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_CANCELLED_BY_LEAVE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "recurringBookingId" TEXT;

-- AlterTable
ALTER TABLE "TherapistLeave" DROP COLUMN "isApproved",
ADD COLUMN     "casualRemaining" INTEGER,
ADD COLUMN     "festiveRemaining" INTEGER,
ADD COLUMN     "optionalRemaining" INTEGER,
ADD COLUMN     "sickRemaining" INTEGER,
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "RecurringBooking" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recurrencePattern" "RecurrencePattern" NOT NULL DEFAULT 'DAILY',
    "dayOfWeek" "DayOfWeek",
    "slotTime" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "RecurringBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringBooking_therapistId_idx" ON "RecurringBooking"("therapistId");

-- CreateIndex
CREATE INDEX "RecurringBooking_parentId_idx" ON "RecurringBooking"("parentId");

-- CreateIndex
CREATE INDEX "RecurringBooking_childId_idx" ON "RecurringBooking"("childId");

-- CreateIndex
CREATE INDEX "RecurringBooking_startDate_endDate_idx" ON "RecurringBooking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "RecurringBooking_isActive_idx" ON "RecurringBooking"("isActive");

-- CreateIndex
CREATE INDEX "Booking_recurringBookingId_idx" ON "Booking"("recurringBookingId");

-- CreateIndex
CREATE INDEX "TherapistLeave_status_idx" ON "TherapistLeave"("status");

-- AddForeignKey
ALTER TABLE "RecurringBooking" ADD CONSTRAINT "RecurringBooking_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBooking" ADD CONSTRAINT "RecurringBooking_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBooking" ADD CONSTRAINT "RecurringBooking_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_recurringBookingId_fkey" FOREIGN KEY ("recurringBookingId") REFERENCES "RecurringBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
