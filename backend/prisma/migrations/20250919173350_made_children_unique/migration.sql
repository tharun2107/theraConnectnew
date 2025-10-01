/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `Child` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `ParentProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `TherapistProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `TherapistProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."TherapistProfile" ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Child_parentId_name_key" ON "public"."Child"("parentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_phone_key" ON "public"."ParentProfile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_phone_key" ON "public"."TherapistProfile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "public"."User"("password");
