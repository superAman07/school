'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@prisma/client';

export async function submitAttendance(
  classSectionId: string, 
  dateStr: string, 
  records: { enrollmentId: string; studentId: string; status: AttendanceStatus; remark: string }[]
) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') throw new Error('Unauthorized');

  // Convert date string to pure date boundary to avoid timezone shift issues
  const dateObj = new Date(dateStr);
  dateObj.setHours(0, 0, 0, 0);

  // We need the academicYearId to create the AttendanceSession
  const classSec = await prisma.classSection.findUnique({ where: { id: classSectionId } });
  if (!classSec) throw new Error('Class not found');

  // Perform inside a safe transaction!
  await prisma.$transaction(async (tx) => {
    // 1. Find or create the Session
    let attSession = await tx.attendanceSession.findFirst({
      where: { classSectionId, sessionDate: dateObj, periodName: null }
    });

    if (!attSession) {
      attSession = await tx.attendanceSession.create({
        data: {
          schoolId: user.schoolId,
          academicYearId: classSec.academicYearId,
          classSectionId,
          sessionDate: dateObj,
          periodName: null,
          takenByUserId: user.id
        }
      });
    } else {
       await tx.attendanceSession.update({
         where: { id: attSession.id },
         data: { takenByUserId: user.id }
       });
    }

    // 2. Overwrite records for this day (Delete -> Insert is safer and cleaner than loop upserting)
    await tx.attendanceRecord.deleteMany({
      where: { sessionId: attSession.id }
    });

    if (records.length > 0) {
      await tx.attendanceRecord.createMany({
        data: records.map(r => ({
          schoolId: user.schoolId,
          sessionId: attSession!.id,
          enrollmentId: r.enrollmentId,
          studentId: r.studentId,
          status: r.status,
          remark: r.remark || null,
          markedByUserId: user.id
        }))
      });
    }
  });

  revalidatePath(`/dashboard/teacher/attendance/${classSectionId}`);
  return { success: true };
}
