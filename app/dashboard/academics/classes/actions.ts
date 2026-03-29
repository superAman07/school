'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createClassSection(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const academicYearId = formData.get('academicYearId') as string;
  const gradeLevelId = formData.get('gradeLevelId') as string;
  const sectionId = formData.get('sectionId') as string;
  const roomName = formData.get('roomName') as string;
  const capacity = formData.get('capacity') as string;

  if (!academicYearId || !gradeLevelId || !sectionId) return { error: 'Year, Grade, and Section are all required.' };

  try {
    await prisma.classSection.create({
      data: {
        schoolId: user.schoolId!,
        academicYearId,
        gradeLevelId,
        sectionId,
        roomName: roomName || null,
        capacity: capacity ? parseInt(capacity) : null
      }
    });

    revalidatePath('/dashboard/academics/classes');
    return { success: 'Class created successfully!' };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'This exact class (Year + Grade + Section) already exists.' };
    console.error(error);
    return { error: 'Failed to create class.' };
  }
}

export async function deleteClassSection(classId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.classSection.delete({
    where: { id: classId, schoolId: user.schoolId! }
  });
  revalidatePath('/dashboard/academics/classes');
}
