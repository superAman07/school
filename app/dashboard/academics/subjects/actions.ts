'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createSubject(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const isOptional = formData.get('isOptional') === 'on';

  if (!name) return { error: 'Subject name is required.' };

  try {
    const count = await prisma.subject.count({ where: { schoolId: user.schoolId! } });

    await prisma.subject.create({
      data: {
        schoolId: user.schoolId!,
        name,
        code: code || null,
        isOptional,
        sortOrder: count + 1
      }
    });

    revalidatePath('/dashboard/academics/subjects');
    return { success: `Subject "${name}" created!` };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'This subject already exists.' };
    console.error(error);
    return { error: 'Failed to create subject.' };
  }
}

export async function deleteSubject(subjectId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.subject.delete({
    where: { id: subjectId, schoolId: user.schoolId! }
  });
  revalidatePath('/dashboard/academics/subjects');
}
