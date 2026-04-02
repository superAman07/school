'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { FormContext, FormAudience } from '@prisma/client';

export async function createForm(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const context = formData.get('context') as FormContext;
  const audience = formData.get('audience') as FormAudience;
  const description = formData.get('description') as string;
  const closingDateRaw = formData.get('closingDate') as string;

  if (!name) return { error: 'Form name is required.' };

  try {
    const code = `form_${Date.now()}`;
    const form = await prisma.formTemplate.create({
      data: {
        schoolId: user.schoolId!,
        name,
        code,
        context: context || 'CUSTOM',
        audience: audience || 'ALL',
        description: description || null,
        closingDate: closingDateRaw ? new Date(closingDateRaw) : null,
        isPublished: false,
        isActive: true,
      }
    });

    revalidatePath('/dashboard/forms');
    return { id: form.id };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to create form. Try again.' };
  }
}

export async function deleteFormTemplate(formId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return;

  await prisma.formTemplate.update({
    where: { id: formId, schoolId: user.schoolId! },
    data: { deletedAt: new Date() }
  });

  revalidatePath('/dashboard/forms');
}

export async function togglePublish(formId: string, current: boolean) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return;

  const form = await prisma.formTemplate.update({
    where: { id: formId, schoolId: user.schoolId! },
    data: { isPublished: !current }
  });

  if (!current) {
    let roles: string[] = [];
    if (form.audience === 'STAFF') roles = ['TEACHER'];
    if (form.audience === 'PARENTS' || form.audience === 'STUDENTS') roles = ['PARENT'];
    if (form.audience === 'ALL') roles = ['TEACHER', 'PARENT'];

    if (roles.length > 0) {
      const usersToAssign = await prisma.user.findMany({
        where: { schoolId: user.schoolId!, role: { in: roles as any }, isActive: true }
      });

      const assignments = usersToAssign.map(u => ({
        schoolId: user.schoolId!,
        formTemplateId: formId,
        assignedToUserId: u.id,
      }));

      if (assignments.length > 0) {
        await prisma.formAssignment.createMany({
          data: assignments,
          skipDuplicates: true,
        });
      }
    }
  }

  revalidatePath('/dashboard/forms');
  revalidatePath(`/dashboard/forms/${formId}`);
}