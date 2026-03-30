import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceForm from './AttendanceForm';

export default async function TakeAttendancePage({
  params, searchParams
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  const { classId } = await params;
  const { date } = await searchParams;
  const attendanceDate = date || new Date().toISOString().split('T')[0];

  const classSection = await prisma.classSection.findUnique({
    where: { id: classId, schoolId: user.schoolId! },
    include: {
      gradeLevel: true,
      section: true,
      academicYear: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { student: true },
        orderBy: { rollNumber: 'asc' }
      }
    }
  });

  if (!classSection) redirect('/dashboard/teacher/attendance');

  // Check if session already taken today
  const existingSession = await prisma.attendanceSession.findFirst({
    where: {
      classSectionId: classId,
      sessionDate: new Date(attendanceDate),
      schoolId: user.schoolId!,
    },
    include: { attendanceRecords: true }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link href="/dashboard/teacher/attendance" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {classSection.gradeLevel.name} — Section {classSection.section.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Attendance for <strong>{new Date(attendanceDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </p>
      </div>

      {existingSession?.isFinalized ? (
        <Card className="border-green-200 bg-green-50 shadow-none">
          <CardContent className="flex items-center gap-3 py-5 px-5">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-green-800">Attendance already submitted for today.</p>
              <p className="text-xs text-green-600 mt-0.5">
                {existingSession.attendanceRecords.filter(r => r.status === 'PRESENT').length} Present ·{' '}
                {existingSession.attendanceRecords.filter(r => r.status === 'ABSENT').length} Absent
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AttendanceForm
          classId={classId}
          attendanceDate={attendanceDate}
          enrollments={classSection.enrollments as any[]}
          existingRecords={existingSession?.attendanceRecords || []}
          sessionId={existingSession?.id || null}
        />
      )}
    </div>
  );
}