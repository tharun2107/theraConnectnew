/*
  Warnings:

  - You are about to drop the column `childPerformance` on the `SessionReport` table. All the data in the column will be lost.
  - You are about to drop the column `improvements` on the `SessionReport` table. All the data in the column will be lost.
  - You are about to drop the column `medication` on the `SessionReport` table. All the data in the column will be lost.
  - You are about to drop the column `nextSteps` on the `SessionReport` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `SessionReport` table. All the data in the column will be lost.
  - You are about to drop the column `sessionExperience` on the `SessionReport` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DemoBookingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "SessionReport" DROP COLUMN "childPerformance",
DROP COLUMN "improvements",
DROP COLUMN "medication",
DROP COLUMN "nextSteps",
DROP COLUMN "recommendations",
DROP COLUMN "sessionExperience",
ADD COLUMN     "childId" TEXT,
ADD COLUMN     "sessionDetails" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "MonthlyGoal" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "MonthlyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTask" (
    "id" TEXT NOT NULL,
    "taskGiven" TEXT NOT NULL,
    "isDone" BOOLEAN,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionReportId" TEXT NOT NULL,

    CONSTRAINT "SessionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSlot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "timeString" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "slotDate" DATE NOT NULL,
    "slotHour" INTEGER NOT NULL,
    "slotTimeString" TEXT NOT NULL,
    "demoSlotId" TEXT,
    "zoomLink" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "status" "DemoBookingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "userQuery" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyGoal_therapistId_childId_idx" ON "MonthlyGoal"("therapistId", "childId");

-- CreateIndex
CREATE INDEX "MonthlyGoal_month_year_idx" ON "MonthlyGoal"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyGoal_therapistId_childId_month_year_key" ON "MonthlyGoal"("therapistId", "childId", "month", "year");

-- CreateIndex
CREATE INDEX "SessionTask_sessionReportId_idx" ON "SessionTask"("sessionReportId");

-- CreateIndex
CREATE INDEX "DemoSlot_year_month_idx" ON "DemoSlot"("year", "month");

-- CreateIndex
CREATE INDEX "DemoSlot_date_isActive_idx" ON "DemoSlot"("date", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DemoSlot_date_hour_key" ON "DemoSlot"("date", "hour");

-- CreateIndex
CREATE INDEX "DemoBooking_email_idx" ON "DemoBooking"("email");

-- CreateIndex
CREATE INDEX "DemoBooking_slotDate_slotHour_idx" ON "DemoBooking"("slotDate", "slotHour");

-- CreateIndex
CREATE INDEX "DemoBooking_status_idx" ON "DemoBooking"("status");

-- CreateIndex
CREATE INDEX "SessionReport_childId_idx" ON "SessionReport"("childId");

-- CreateIndex
CREATE INDEX "SessionReport_createdAt_idx" ON "SessionReport"("createdAt");

-- AddForeignKey
ALTER TABLE "MonthlyGoal" ADD CONSTRAINT "MonthlyGoal_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyGoal" ADD CONSTRAINT "MonthlyGoal_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReport" ADD CONSTRAINT "SessionReport_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sessionReportId_fkey" FOREIGN KEY ("sessionReportId") REFERENCES "SessionReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoBooking" ADD CONSTRAINT "DemoBooking_demoSlotId_fkey" FOREIGN KEY ("demoSlotId") REFERENCES "DemoSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
