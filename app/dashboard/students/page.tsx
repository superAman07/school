import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function StudentDirectoryPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const students = await prisma.student.findMany({
    where: { schoolId: user.schoolId! },
    include: {
      guardians: {
        include: { parent: { include: { profile: true } } },
        where: { isPrimary: true },
        take: 1
      },
      enrollments: {
        include: {
          classSection: {
            include: { gradeLevel: true, section: true, academicYear: true }
          }
        },
        where: { status: 'ACTIVE' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Student Directory</h1>
          <p className="text-gray-500 mt-2 text-lg">All admitted students across your school.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-center">
          <p className="text-3xl font-black text-blue-700">{students.length}</p>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Students</p>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardHeader className="bg-gray-50 border-b p-5">
          <CardTitle className="text-lg">All Students</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="text-center py-20 px-4">
              <p className="text-gray-500 font-medium text-lg">No students enrolled yet.</p>
              <p className="text-gray-400 text-sm mt-2">Approve an admission application to auto-create a student record.</p>
              <Link href="/dashboard/admissions" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
                Go to Admissions Pipeline →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="p-5">Student</th>
                    <th className="p-5">Class</th>
                    <th className="p-5">Guardian</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const enrollment = student.enrollments[0];
                    const guardian = student.guardians[0];
                    return (
                      <tr key={student.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {student.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{student.firstName} {student.lastName || ''}</p>
                              {student.admissionNo && (
                                <p className="text-xs font-mono text-gray-400">{student.admissionNo}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          {enrollment ? (
                            <div>
                              <p className="font-semibold text-gray-800">{enrollment.classSection.gradeLevel.name} — Sec {enrollment.classSection.section.name}</p>
                              <p className="text-xs text-gray-400">{enrollment.classSection.academicYear.name}</p>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                          )}
                        </td>
                        <td className="p-5">
                          {guardian ? (
                            <div>
                              <p className="font-semibold text-sm text-gray-800">
                                {guardian.parent.profile?.firstName} {guardian.parent.profile?.lastName || ''}
                              </p>
                              <p className="text-xs text-gray-400">{guardian.parent.email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="p-5">
                          <Badge className={`text-xs ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600'}`}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="p-5">
                          <Link href={`/dashboard/students/${student.id}`}>
                            <button className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-600 transition-all cursor-pointer">
                              View →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
