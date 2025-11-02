-- CreateEnum
CREATE TYPE "DemoBookingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

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

-- AddForeignKey
ALTER TABLE "DemoBooking" ADD CONSTRAINT "DemoBooking_demoSlotId_fkey" FOREIGN KEY ("demoSlotId") REFERENCES "DemoSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
