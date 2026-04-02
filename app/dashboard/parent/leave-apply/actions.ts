'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function createLeaveRequest(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'PARENT') return { error: 'Unauthorized' };

  const studentId = formData.get('studentId') as string;
  const leaveType = formData.get('leaveType') as string;
  const fromDate = new Date(formData.get('fromDate') as string);
  const toDate = new Date(formData.get('toDate') as string);
  const reason = formData.get('reason') as string;

  if (!studentId || !leaveType || !fromDate || !toDate || !reason) {
    return { error: 'All fields are strictly required.' };
  }

  // Validate parent owns child
  const guardianLink = await prisma.studentGuardian.findFirst({
    where: { schoolId: user.schoolId, studentId, parentId: user.id }
  });
  
  if (!guardianLink) return { error: 'Unauthorized to act on behalf of this student.' };

  await prisma.leaveRequest.create({
    data: {
      schoolId: user.schoolId,
      studentId,
      requestedByUserId: user.id,
      leaveType,
      fromDate,
      toDate,
      reason,
      status: 'PENDING'
    }
  });

  redirect('/dashboard/parent');
}
