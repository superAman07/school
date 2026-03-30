'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@prisma/client';

export async function submitAttendance({
  classId,
  attendanceDate,
  statuses,
  sessionId,
}: {
  classId: string;
  attendanceDate: string;
  statuses: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>;
  sessionId: string | null;
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') return { error: 'Unauthorized' };

  const classSection = await prisma.classSection.findUnique({
    where: { id: classId, schoolId: user.schoolId! },
    include: { academicYear: true }
  });

  if (!classSection) return { error: 'Class not found.' };

  try {
    await prisma.$transaction(async (tx) => {
      // Create or get the session
      let attendanceSession;
      if (sessionId) {
        attendanceSession = await tx.attendanceSession.update({
          where: { id: sessionId },
          data: { isFinalized: true, takenByUserId: user.id }
        });
      } else {
        attendanceSession = await tx.attendanceSession.create({
          data: {
            schoolId: user.schoolId!,
            academicYearId: classSection.academicYearId,
            classSectionId: classId,
            sessionDate: new Date(attendanceDate),
            takenByUserId: user.id,
            isFinalized: true,
          }
        });
      }

      // Upsert each student's attendance record
      for (const [enrollmentId, status] of Object.entries(statuses)) {
        const enrollment = await tx.studentEnrollment.findUnique({
          where: { id: enrollmentId }
        });
        if (!enrollment) continue;

        await tx.attendanceRecord.upsert({
          where: { sessionId_enrollmentId: { sessionId: attendanceSession.id, enrollmentId } },
          create: {
            schoolId: user.schoolId!,
            sessionId: attendanceSession.id,
            enrollmentId,
            studentId: enrollment.studentId,
            status: status as AttendanceStatus,
            markedByUserId: user.id,
          },
          update: {
            status: status as AttendanceStatus,
            markedByUserId: user.id,
            markedAt: new Date(),
          }
        });
      }
    });

    revalidatePath(`/dashboard/teacher/attendance/${classId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to save attendance. Try again.' };
  }
}