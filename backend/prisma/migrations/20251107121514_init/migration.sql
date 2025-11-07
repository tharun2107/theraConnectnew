/*
  Warnings:

  - You are about to drop the column `name` on the `AdminProfile` table. All the data in the column will be lost.
  - You are about to drop the column `availableSlotTimes` on the `TherapistProfile` table. All the data in the column will be lost.
  - You are about to drop the `DemoBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemoSlot` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `casualRemaining` on table `TherapistLeave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `festiveRemaining` on table `TherapistLeave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `optionalRemaining` on table `TherapistLeave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sickRemaining` on table `TherapistLeave` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."DemoBooking" DROP CONSTRAINT "DemoBooking_demoSlotId_fkey";

-- DropIndex
DROP INDEX "public"."RecurringBooking_isActive_idx";

-- DropIndex
DROP INDEX "public"."TherapistLeave_status_idx";

-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "TherapistLeave" ALTER COLUMN "casualRemaining" SET NOT NULL,
ALTER COLUMN "casualRemaining" SET DEFAULT 5,
ALTER COLUMN "festiveRemaining" SET NOT NULL,
ALTER COLUMN "festiveRemaining" SET DEFAULT 5,
ALTER COLUMN "optionalRemaining" SET NOT NULL,
ALTER COLUMN "optionalRemaining" SET DEFAULT 1,
ALTER COLUMN "sickRemaining" SET NOT NULL,
ALTER COLUMN "sickRemaining" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "TherapistProfile" DROP COLUMN "availableSlotTimes",
ADD COLUMN     "selectedSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "leavesRemainingThisMonth" SET DEFAULT 1,
ALTER COLUMN "scheduleStartTime" SET DEFAULT '09:00',
ALTER COLUMN "slotDurationInMinutes" SET DEFAULT 60;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."DemoBooking";

-- DropTable
DROP TABLE "public"."DemoSlot";

-- DropEnum
DROP TYPE "public"."DemoBookingStatus";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_type_token_key" ON "VerificationToken"("identifier", "type", "token");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
