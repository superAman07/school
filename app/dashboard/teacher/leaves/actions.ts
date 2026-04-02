'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function processLeave(leaveId: string, status: 'APPROVED' | 'REJECTED', decisionNote: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') throw new Error('Unauthorized');

  // Ensure this leave exists and belongs to a student this teacher manages
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId, schoolId: user.schoolId },
    include: { 
      student: { 
        include: { 
          enrollments: { 
            where: { status: 'ACTIVE' }, 
            include: { classSection: true } 
          } 
        } 
      } 
    }
  });

  if (!leave || !leave.student) throw new Error('Leave not found or not student-bound');

  // Verify the teacher is actually the Class Teacher of this student
  const isMyStudent = leave.student.enrollments.some(e => e.classSection.classTeacherId === user.id);
  if (!isMyStudent) throw new Error('You are not authorized to approve leaves for this student');

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status,
      decisionNote: decisionNote || null,
      reviewedByUserId: user.id,
      reviewedAt: new Date()
    }
  });

  revalidatePath('/dashboard/teacher/leaves');
  return { success: true };
}
