'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { GuardianRelation } from '@prisma/client';

export async function approveApplication(applicationId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id: applicationId, schoolId: user.schoolId! }
    });

    if (!application || application.status !== 'SUBMITTED') return;

    // 🚀 We use a secure Prisma Transaction to guarantee neither operation fails halfway!
    await prisma.$transaction(async (tx) => {
      // 1. Mark the application officially approved
      await tx.admissionApplication.update({
        where: { id: application.id },
        data: { 
          status: 'APPROVED',
          reviewedByUserId: user.id,
          reviewedAt: new Date()
        }
      });

      // 2. Generate the official permanent Student database record
      const student = await tx.student.create({
        data: {
          schoolId: application.schoolId,
          firstName: application.scholarName || 'New Student', 
          sourceApplicationId: application.id,
          // We permanently inject all the dynamic fields into the core student profile!
          formData: application.extraData as object || {}
        }
      });

      // 3. Link the Parent's account permanently to the child!
      if (application.submittedByUserId) {
        await tx.studentGuardian.create({
          data: {
            schoolId: application.schoolId,
            studentId: student.id,
            parentId: application.submittedByUserId,
            relation: GuardianRelation.GUARDIAN,
            isPrimary: true
          }
        });
      }
    });

    // Refresh the UI to hide the buttons
    revalidatePath(`/dashboard/admissions`);
    revalidatePath(`/dashboard/admissions/${applicationId}`);
  } catch (error) {
    console.error("Enrollment failed:", error);
  }
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  // Safely reject the application without creating any child accounts
  await prisma.admissionApplication.update({
    where: { id: applicationId, schoolId: user.schoolId! },
    data: { 
      status: 'REJECTED',
      reviewedByUserId: user.id,
      reviewedAt: new Date()
    }
  });

  revalidatePath(`/dashboard/admissions`);
  revalidatePath(`/dashboard/admissions/${applicationId}`);
}