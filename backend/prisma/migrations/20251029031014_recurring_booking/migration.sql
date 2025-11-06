/*
  Warnings:

  - Added the required column `endDate` to the `RecurringBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `RecurringBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringBooking" ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "startDate" DATE NOT NULL,
ALTER COLUMN "recurrencePattern" SET DEFAULT 'DAILY';

-- CreateIndex
CREATE INDEX "RecurringBooking_startDate_endDate_idx" ON "RecurringBooking"("startDate", "endDate");
