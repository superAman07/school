'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { InputType } from '@prisma/client';

export async function addField(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const formId = formData.get('formId') as string;
  const label = formData.get('label') as string;
  const inputType = formData.get('inputType') as InputType;
  const placeholder = formData.get('placeholder') as string;
  const required = formData.get('required') === 'on';
  const optionsRaw = formData.get('options') as string;

  if (!label) return { error: 'Field label is required.' };

  const options = optionsRaw
    ? optionsRaw.split(',').map(o => o.trim()).filter(Boolean)
    : null;

  try {
    const maxField = await prisma.formField.findFirst({
      where: { templateId: formId },
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = (maxField?.sortOrder ?? -1) + 1;

    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40) + `_${sortOrder}`;

    await prisma.formField.create({
      data: {
        schoolId: user.schoolId!,
        templateId: formId,
        label,
        key,
        inputType,
        placeholder: placeholder || null,
        required,
        sortOrder,
        options: options ? options : undefined,
      }
    });

    revalidatePath(`/dashboard/forms/${formId}`);
    return { success: '✅ Field added!' };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add field. Try again.' };
  }
}

export async function deleteFormField(fieldId: string, formId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return;

  await prisma.formField.delete({ where: { id: fieldId, schoolId: user.schoolId! } });
  revalidatePath(`/dashboard/forms/${formId}`);
}

export async function reorderFields(formId: string, fieldIds: string[]) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return;

  await Promise.all(
    fieldIds.map((id, index) =>
      prisma.formField.update({
        where: { id, schoolId: user.schoolId! },
        data: { sortOrder: index }
      })
    )
  );
  revalidatePath(`/dashboard/forms/${formId}`);
}

export async function updateFieldLabel(fieldId: string, newLabel: string, formId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return;

  await prisma.formField.update({
    where: { id: fieldId, schoolId: user.schoolId! },
    data: { label: newLabel }
  });

  revalidatePath(`/dashboard/forms/${formId}`);
}