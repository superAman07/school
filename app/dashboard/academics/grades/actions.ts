'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createGradeLevel(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  if (!name) return { error: 'Grade name is required.' };

  try {
    const count = await prisma.gradeLevel.count({ where: { schoolId: user.schoolId! } });

    await prisma.gradeLevel.create({
      data: {
        schoolId: user.schoolId!,
        name,
        sortOrder: count + 1
      }
    });

    revalidatePath('/dashboard/academics/grades');
    return { success: `Grade "${name}" created!` };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'This grade already exists.' };
    console.error(error);
    return { error: 'Failed to create grade.' };
  }
}

export async function deleteGradeLevel(gradeId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.gradeLevel.delete({
    where: { id: gradeId, schoolId: user.schoolId! }
  });
  revalidatePath('/dashboard/academics/grades');
}

export async function createSection(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  if (!name) return { error: 'Section name is required.' };

  try {
    const count = await prisma.section.count({ where: { schoolId: user.schoolId! } });

    await prisma.section.create({
      data: {
        schoolId: user.schoolId!,
        name,
        sortOrder: count + 1
      }
    });

    revalidatePath('/dashboard/academics/grades');
    return { success: `Section "${name}" created!` };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'This section already exists.' };
    console.error(error);
    return { error: 'Failed to create section.' };
  }
}

export async function deleteSection(sectionId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.section.delete({
    where: { id: sectionId, schoolId: user.schoolId! }
  });
  revalidatePath('/dashboard/academics/grades');
}
