'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const studentId = formData.get('studentId') as string;
  const classSectionId = formData.get('classSectionId') as string;
  const rollNumberRaw = formData.get('rollNumber') as string;
  const rollNumber = rollNumberRaw ? parseInt(rollNumberRaw) : null;

  if (!studentId || !classSectionId) {
    return { error: 'Please select a class section.' };
  }

  try {
    const classSection = await prisma.classSection.findUnique({
      where: { id: classSectionId, schoolId: user.schoolId! },
    });
    if (!classSection) return { error: 'Class not found.' };

    // Check if already enrolled in this academic year
    const existing = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        academicYearId: classSection.academicYearId,
        schoolId: user.schoolId!,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return { error: 'Student is already enrolled in a class for this academic year.' };
    }

    await prisma.studentEnrollment.create({
      data: {
        schoolId: user.schoolId!,
        studentId,
        classSectionId,
        academicYearId: classSection.academicYearId,
        rollNumber,
        status: 'ACTIVE',
      },
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: 'Student enrolled successfully! ✅' };
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2002') {
      return { error: 'Roll number already taken in this class. Try a different one.' };
    }
    return { error: 'Failed to enroll. Please try again.' };
  }
}
