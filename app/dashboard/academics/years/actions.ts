'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createAcademicYear(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const isCurrent = formData.get('isCurrent') === 'on';

  if (!name || !startDate || !endDate) return { error: 'All fields are required.' };

  try {
    // If this year is marked as current, unset all others first
    if (isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId: user.schoolId! },
        data: { isCurrent: false }
      });
    }

    await prisma.academicYear.create({
      data: {
        schoolId: user.schoolId!,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent
      }
    });

    revalidatePath('/dashboard/academics/years');
    return { success: `Academic Year "${name}" created!` };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'This academic year name already exists for your school.' };
    console.error(error);
    return { error: 'Failed to create academic year.' };
  }
}

export async function deleteAcademicYear(yearId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.academicYear.delete({
    where: { id: yearId, schoolId: user.schoolId! }
  });

  revalidatePath('/dashboard/academics/years');
}
