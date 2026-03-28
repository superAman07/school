'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { FormContext, InputType } from '@prisma/client';

export async function addFormField(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.schoolId || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const label = formData.get('label') as string; 
  const inputType = formData.get('inputType') as InputType;
  const isRequired = formData.get('required') === 'on';

  if (!label) return { error: 'Label is required.' };

  const key = label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

  try {
    let template = await prisma.formTemplate.findFirst({
      where: { schoolId: session.user.schoolId, context: FormContext.ADMISSION }
    });

    if (!template) {
      template = await prisma.formTemplate.create({
        data: {
          schoolId: session.user.schoolId,
          code: 'ADMISSION_FORM_v1',
          name: 'Main Admission Application',
          context: FormContext.ADMISSION
        }
      });
    }

    const existingCount = await prisma.formField.count({ where: { templateId: template.id } });

    await prisma.formField.create({
      data: {
        schoolId: session.user.schoolId,
        templateId: template.id,
        key: `${key}_${Date.now()}`,
        label,
        inputType,
        required: isRequired,
        sortOrder: existingCount + 1
      }
    });

    revalidatePath('/dashboard/admissions/form-builder');
    return { success: 'Field added dynamically!' };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to add dynamic field.' };
  }
}

export async function deleteFormField(fieldId: string) {
  const session = await auth();
  if (!session?.user?.schoolId || session.user.role !== 'ADMIN') throw new Error('Unauthorized');
  try {
    await prisma.formField.delete({
      where: { 
        id: fieldId,
        schoolId: session.user.schoolId 
      }
    });
    revalidatePath('/dashboard/admissions/form-builder');
  } catch (error) {
    console.error(error);
  }
}