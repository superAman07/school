import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, Search, Filter } from 'lucide-react';

export default async function StudentDirectoryPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Student Directory
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Manage all officially enrolled scholars in your institution.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admissions">
            <button className="bg-white border-2 border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-50 shadow-sm transition-colors text-sm">
               Review Pending Admissions
            </button>
          </Link>
        </div>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Enrolled Database</CardTitle>
            <CardDescription className="font-medium mt-1 text-gray-500">Total Active Students: {students.length}</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or admission no..." 
                className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 shadow-sm text-gray-500 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="text-center py-20 px-4 bg-gray-50/50">
               <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">Your school has no students enrolled yet.</p>
              <Link href="/dashboard/admissions">
                <button className="mt-4 text-indigo-600 font-bold hover:underline">Go to Admissions to enroll students &rarr;</button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-xs">Student Profile</th>
                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-xs">Admission No</th>
                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-xs">Current Class</th>
                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-xs">Primary Guardian</th>
                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {students.map(student => {
                     const enrollment = student.enrollments[0];
                     const guardian = student.guardians[0];
                     return (
                      <tr key={student.id} className="hover:bg-indigo-50/40 transition cursor-pointer group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 uppercase">
                               {student.firstName[0]}
                            </div>
                            <span className="font-extrabold text-gray-900 text-base">{student.firstName} {student.lastName || ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs font-bold">{student.admissionNo || '—'}</td>
                        <td className="px-6 py-4">
                           {enrollment ? (
                             <div className="flex flex-col">
                               <span className="font-bold text-gray-900">{enrollment.classSection.gradeLevel.name} - Sec {enrollment.classSection.section.name}</span>
                               <span className="text-xs text-gray-400 font-mono mt-0.5">{enrollment.classSection.academicYear.name}</span>
                             </div>
                           ) : (
                             <span className="text-gray-400 italic text-xs font-medium">Unassigned</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {guardian ? (
                             <div className="flex flex-col">
                               <span className="font-bold text-gray-800">{guardian.parent.profile?.firstName || 'Parent'}</span>
                               <span className="text-xs text-gray-400 font-mono mt-0.5">{guardian.parent.email}</span>
                             </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                            <Badge className={`${
                              student.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 shadow-sm' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {student.status}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/students/${student.id}`}>
                             <button className="text-indigo-600 font-black hover:text-indigo-800 bg-white border shadow-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:shadow">
                               Open Profile
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