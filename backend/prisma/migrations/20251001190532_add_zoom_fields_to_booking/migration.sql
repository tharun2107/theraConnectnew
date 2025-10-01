-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "hostStarted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meetingId" TEXT,
ADD COLUMN     "meetingPassword" TEXT;
