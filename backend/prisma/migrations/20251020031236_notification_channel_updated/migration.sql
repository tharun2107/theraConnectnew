/*
  Warnings:

  - Added the required column `channel` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sendAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'GRANTED', 'DENIED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SESSION_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_READY';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_PENDING';
ALTER TYPE "NotificationType" ADD VALUE 'CONSENT_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'CONSENT_RESPONSE';
ALTER TYPE "NotificationType" ADD VALUE 'REGISTRATION_SUCCESSFUL';

-- DropIndex
DROP INDEX "public"."Notification_userId_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "channel" "NotificationChannel" NOT NULL,
ADD COLUMN     "sendAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "NotificationStatus" NOT NULL;

-- CreateTable
CREATE TABLE "SessionReport" (
    "id" TEXT NOT NULL,
    "sessionExperience" TEXT NOT NULL,
    "childPerformance" TEXT,
    "improvements" TEXT,
    "medication" TEXT,
    "recommendations" TEXT,
    "nextSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "SessionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRequest" (
    "id" TEXT NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,
    "bookingId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "ConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "SessionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionReport_bookingId_key" ON "SessionReport"("bookingId");

-- CreateIndex
CREATE INDEX "SessionReport_therapistId_idx" ON "SessionReport"("therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRequest_bookingId_key" ON "ConsentRequest"("bookingId");

-- CreateIndex
CREATE INDEX "ConsentRequest_parentId_idx" ON "ConsentRequest"("parentId");

-- CreateIndex
CREATE INDEX "ConsentRequest_therapistId_idx" ON "ConsentRequest"("therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionFeedback_bookingId_key" ON "SessionFeedback"("bookingId");

-- CreateIndex
CREATE INDEX "SessionFeedback_parentId_idx" ON "SessionFeedback"("parentId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_sendAt_idx" ON "Notification"("userId", "status", "sendAt");

-- AddForeignKey
ALTER TABLE "SessionReport" ADD CONSTRAINT "SessionReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReport" ADD CONSTRAINT "SessionReport_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
