-- AlterTable
ALTER TABLE "public"."TherapistProfile" ADD COLUMN     "maxSlotsPerDay" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "scheduleStartTime" TEXT NOT NULL DEFAULT '10:00',
ADD COLUMN     "slotDurationInMinutes" INTEGER NOT NULL DEFAULT 45;

-- CreateTable
CREATE TABLE "public"."TherapistBreak" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "TherapistBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TherapistBreak_therapistId_idx" ON "public"."TherapistBreak"("therapistId");

-- AddForeignKey
ALTER TABLE "public"."TherapistBreak" ADD CONSTRAINT "TherapistBreak_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
