-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "canManageAdmissions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAdminStaff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTeacher" BOOLEAN NOT NULL DEFAULT true;
