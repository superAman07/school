import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { School, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AttendancePage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  // Get classes assigned to this teacher
  const myClasses = await prisma.classSection.findMany({
    where: { classTeacherId: user.id, schoolId: user.schoolId! },
    include: {
      gradeLevel: true,
      section: true,
      academicYear: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { student: true }
      }
    }
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 mt-1 text-sm">Select a class to mark today's attendance.</p>
      </div>

      {myClasses.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none">
          <CardContent className="text-center py-12 text-gray-400">
            <School className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">No classes assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myClasses.map(cls => (
            <Link key={cls.id} href={`/dashboard/teacher/attendance/${cls.id}?date=${today}`}>
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">{cls.gradeLevel.name} — Section {cls.section.name}</p>
                  <p className="text-sm text-gray-500">{cls.enrollments.length} students · {cls.academicYear.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
                    Take Attendance
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}