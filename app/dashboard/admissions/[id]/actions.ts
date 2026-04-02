'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { GuardianRelation, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

export async function approveAndEnroll(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return { error: 'Unauthorized' };

  const submissionId = formData.get('submissionId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const parentEmail = formData.get('parentEmail') as string;

  if (!firstName) return { error: 'Student First Name is required to officially enroll.' };

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId, schoolId: user.schoolId! }
    });
    if (!submission || submission.status !== 'SUBMITTED') return { error: 'Form is no longer pending.' };

    await prisma.$transaction(async (tx) => {
      // 1. Mark form as Approved
      await tx.formSubmission.update({
        where: { id: submissionId },
        data: { status: 'APPROVED' }
      });

      // 2. Generate the Official Student Profile!
      const student = await tx.student.create({
        data: {
          schoolId: submission.schoolId,
          firstName,
          lastName: lastName || null,
          status: 'ACTIVE',
          admissionNo: `ADM-${Date.now()}`,
          formData: submission.data || {}, // Save all their weird custom answers forever!
        }
      });

      // 3. The Parent Mapping Magic (If valid email is given)
      if (parentEmail && parentEmail.includes('@')) {
         let parentUser = await tx.user.findUnique({ where: { email: parentEmail }});
         
         // If this Parent doesn't exist yet, WE AUTO CREATE IT!
         if (!parentUser) {
           const tempPassword = parentEmail.split('@')[0] + '@123!';
           parentUser = await tx.user.create({
             data: {
               email: parentEmail.toLowerCase().trim(),
               role: Role.PARENT,
               passwordHash: await hash(tempPassword, 10),
               schoolId: submission.schoolId,
             }
           });
         }
         
         // Build the Bridge linking Parent to Student!
         await tx.studentGuardian.create({
           data: {
             schoolId: submission.schoolId,
             studentId: student.id,
             parentId: parentUser.id,
             relation: GuardianRelation.GUARDIAN,
             isPrimary: true
           }
         });
      }
    });

    revalidatePath('/dashboard/admissions');
    revalidatePath(`/dashboard/admissions/${submissionId}`);
    return { success: 'Student officially enrolled! Parent account linked.' };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to enroll student. Please check database constraints.' };
  }
}

export async function rejectSubmission(submissionId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) throw new Error('Unauthorized');

  await prisma.formSubmission.update({
    where: { id: submissionId, schoolId: user.schoolId! },
    data: { status: 'REJECTED' }
  });

  revalidatePath('/dashboard/admissions');
  revalidatePath(`/dashboard/admissions/${submissionId}`);
}