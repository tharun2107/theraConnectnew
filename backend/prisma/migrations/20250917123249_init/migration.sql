-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PARENT', 'THERAPIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED_BY_PARENT', 'CANCELLED_BY_THERAPIST', 'CANCELLED_BY_ADMIN');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."TherapistStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."LeaveType" AS ENUM ('FULL_DAY');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'SESSION_REMINDER', 'PAYMENT_SUCCESS', 'THERAPIST_ACCOUNT_APPROVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "customFee" DOUBLE PRECISION,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TherapistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "baseCostPerSession" DOUBLE PRECISION NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."TherapistStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "leavesRemainingThisMonth" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "TherapistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "address" TEXT,
    "condition" TEXT,
    "notes" TEXT,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimeSlot" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "zoomLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TherapistLeave" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "public"."LeaveType" NOT NULL,
    "reason" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "TherapistLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataAccessPermission" (
    "id" TEXT NOT NULL,
    "canViewDetails" BOOLEAN NOT NULL DEFAULT false,
    "accessStartTime" TIMESTAMP(3) NOT NULL,
    "accessEndTime" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "DataAccessPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Testimonial" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "bookingId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."NotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "public"."AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "public"."ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_userId_key" ON "public"."TherapistProfile"("userId");

-- CreateIndex
CREATE INDEX "TherapistProfile_specialization_idx" ON "public"."TherapistProfile"("specialization");

-- CreateIndex
CREATE INDEX "Child_parentId_idx" ON "public"."Child"("parentId");

-- CreateIndex
CREATE INDEX "TimeSlot_therapistId_startTime_idx" ON "public"."TimeSlot"("therapistId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_timeSlotId_key" ON "public"."Booking"("timeSlotId");

-- CreateIndex
CREATE INDEX "Booking_parentId_therapistId_childId_idx" ON "public"."Booking"("parentId", "therapistId", "childId");

-- CreateIndex
CREATE INDEX "TherapistLeave_therapistId_date_idx" ON "public"."TherapistLeave"("therapistId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DataAccessPermission_bookingId_key" ON "public"."DataAccessPermission"("bookingId");

-- CreateIndex
CREATE INDEX "DataAccessPermission_childId_therapistId_idx" ON "public"."DataAccessPermission"("childId", "therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_bookingId_key" ON "public"."Testimonial"("bookingId");

-- CreateIndex
CREATE INDEX "Testimonial_therapistId_idx" ON "public"."Testimonial"("therapistId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistProfile" ADD CONSTRAINT "TherapistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeSlot" ADD CONSTRAINT "TimeSlot_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "public"."TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistLeave" ADD CONSTRAINT "TherapistLeave_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataAccessPermission" ADD CONSTRAINT "DataAccessPermission_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataAccessPermission" ADD CONSTRAINT "DataAccessPermission_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataAccessPermission" ADD CONSTRAINT "DataAccessPermission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ParentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
