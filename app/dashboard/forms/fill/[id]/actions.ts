'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function submitForm(formTemplateId: string, data: any) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) return { error: 'Unauthorized' };

  try {
    // 1. Verify access again at submit time
        // 1. Verify access again at submit time
    let isAllowed = false;
    let isProxySubmission = false;
    
    // Check what context the form is
    const form = await prisma.formTemplate.findUnique({ where: { id: formTemplateId }});
    if (!form || !form.isPublished) return { error: 'Form unavailable.' };

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      isAllowed = true;
    } else if (user.role === 'TEACHER') {
      const staffProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
      if (staffProfile?.canManageAdmissions && form.context === 'ADMISSION') {
        isAllowed = true;
        isProxySubmission = true;
      } else {
        const assignment = await prisma.formAssignment.findUnique({
          where: { formTemplateId_assignedToUserId: { formTemplateId, assignedToUserId: user.id } }
        });
        if (assignment && !assignment.isExcluded && !assignment.hasSubmitted) {
          isAllowed = true;
        }
      }
    }

    if (!isAllowed) return { error: 'Access Denied or already submitted.' };

    // 2. Create the submission
    await prisma.formSubmission.create({
      data: {
        schoolId: user.schoolId!,
        templateId: formTemplateId,
        submittedByUserId: user.id, // They are the one doing the typing
        status: 'SUBMITTED',
        data: data,
      }
    });

    // 3. ONLY mark the assignment as submitted IF it's not a proxy admission!
    if (!isProxySubmission && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      await prisma.formAssignment.update({
        where: { formTemplateId_assignedToUserId: { formTemplateId, assignedToUserId: user.id } },
        data: { hasSubmitted: true }
      });
    }

    revalidatePath('/dashboard/teacher');
    revalidatePath('/dashboard/forms');
    return { success: true };
  } catch (err) {
    console.error('Submit Form Error:', err);
    return { error: 'Failed to submit form. Please try again.' };
  }
}
