import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, User, BookOpen, Users, FileText, GraduationCap } from 'lucide-react';
import EnrollStudentForm from './EnrollStudentForm';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/dashboard');

  const [student, classSections] = await Promise.all([
    prisma.student.findFirst({
      where: { id: params.id, schoolId: user.schoolId! },
      include: {
        guardians: { include: { parent: { include: { profile: true } } } },
        enrollments: {
          include: {
            classSection: { include: { gradeLevel: true, section: true, academicYear: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.classSection.findMany({
      where: { schoolId: user.schoolId!, deletedAt: null },
      include: { gradeLevel: true, section: true, academicYear: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!student) notFound();

  // Format the Class options precisely for your existing form
  const classSectionOptions = classSections.map(cls => ({
    id: cls.id,
    label: `${cls.gradeLevel.name} — Section ${cls.section.name} (${cls.academicYear.name})`,
    academicYearId: cls.academicYearId,
  }));

  // Parse the generic Application Form answers!
  const customAnswers = (student.formData as Record<string, any>) || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div>
        <Link href="/dashboard/students" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-bold mb-4 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <div className="flex items-center gap-5 flex-wrap bg-white p-6 rounded-2xl shadow-sm border">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-3xl shadow-inner shrink-0 uppercase">
            {student.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              {student.firstName} {student.lastName || ''}
            </h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {student.admissionNo && <Badge className="text-xs px-3 py-1 bg-gray-100 text-gray-600 shadow-sm">{student.admissionNo}</Badge>}
              <Badge className={`text-xs px-3 py-1 shadow-sm ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {student.status}
              </Badge>
              <Badge className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">Enrolled: {new Date(student.createdAt).getFullYear()}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Core Enrollment & Class */}
        <div className="space-y-6">
          
          <Card className="shadow-lg border-0 border-t-4 border-t-indigo-600">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100 p-5">
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                <GraduationCap className="w-5 h-5" /> Current Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {student.enrollments.length === 0 ? (
                <div className="p-6 bg-white border-b border-l-4 border-l-red-400">
                   <p className="text-red-600 font-bold text-sm mb-2">Student is not assigned to a class.</p>
                   <p className="text-xs text-gray-500 mb-4">You must enroll this student before teachers can take attendance.</p>
                   <EnrollStudentForm studentId={student.id} classSections={classSectionOptions} />
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {student.enrollments.map(e => (
                    <li key={e.id} className="p-6 bg-white">
                      <p className="font-extrabold text-xl text-gray-900">{e.classSection.gradeLevel.name} — Section {e.classSection.section.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{e.classSection.academicYear.name}</span>
                        {e.rollNumber && <span className="text-sm font-bold text-gray-500">· Roll #{e.rollNumber}</span>}
                        <Badge className={`text-xs ml-auto shadow-sm ${e.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{e.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Linked Guardian (Parent Portal Mapping) */}
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900"><Users className="w-5 h-5" /> Linked Guardians</CardTitle>
              <CardDescription className="text-xs mt-1 text-gray-500">Accounts with Parent Portal access.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {student.guardians.length === 0 ? (
                <p className="text-gray-400 text-center py-10 text-sm font-medium">No parent portal accounts linked.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {student.guardians.map(g => (
                    <li key={g.id} className="px-6 py-5 bg-white">
                      <p className="font-bold text-gray-900 text-lg">{g.parent.profile?.firstName} {g.parent.profile?.lastName || ''}</p>
                      <p className="text-sm text-gray-500 font-mono mt-0.5">{g.parent.email}</p>
                      <div className="flex gap-2 mt-3">
                        {g.isPrimary && <Badge className="text-xs bg-indigo-100 text-indigo-800 shadow-sm border-none">Primary</Badge>}
                        {g.canApplyLeave && <Badge className="text-xs bg-green-100 text-green-800 shadow-sm border-none">Can Apply Leave</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Dynamic App Form Responses */}
        <div className="space-y-6">
          <Card className="shadow-md border-0 bg-gray-50">
            <CardHeader className="border-b p-5 bg-white">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900"><FileText className="w-5 h-5 text-gray-500" /> Original Form Data</CardTitle>
              <CardDescription className="text-xs mt-1">This data was extracted from the dynamic admission form.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {Object.keys(customAnswers).length === 0 ? (
                <p className="text-gray-400 text-sm italic col-span-full">No custom form data was provided.</p>
              ) : (
                Object.entries(customAnswers).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-50 pb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{key}</p>
                    <p className="font-semibold text-gray-800 whitespace-pre-wrap">{String(value) || '—'}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}