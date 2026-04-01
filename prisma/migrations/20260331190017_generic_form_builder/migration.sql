-- CreateEnum
CREATE TYPE "FormAudience" AS ENUM ('ALL', 'STAFF', 'PARENTS', 'STUDENTS');

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "audience" "FormAudience" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FormAssignment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "assignedToUserId" TEXT NOT NULL,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "hasViewed" BOOLEAN NOT NULL DEFAULT false,
    "hasSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormAssignment_schoolId_assignedToUserId_idx" ON "FormAssignment"("schoolId", "assignedToUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAssignment_formTemplateId_assignedToUserId_key" ON "FormAssignment"("formTemplateId", "assignedToUserId");

-- CreateIndex
CREATE INDEX "FormTemplate_schoolId_audience_isPublished_idx" ON "FormTemplate"("schoolId", "audience", "isPublished");

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
