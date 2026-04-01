import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, User, BookOpen, Users, FileText, GraduationCap } from 'lucide-react';
import EnrollStudentForm from './EnrollStudentForm';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const { id } = await params;

  const [student, classSections] = await Promise.all([
    prisma.student.findFirst({
      where: { id, schoolId: user.schoolId! },
      include: {
        guardians: { include: { parent: { include: { profile: true } } } },
        enrollments: {
          include: {
            classSection: { include: { gradeLevel: true, section: true, academicYear: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        sourceApplication: true
      }
    }),
    prisma.classSection.findMany({
      where: { schoolId: user.schoolId!, deletedAt: null },
      include: { gradeLevel: true, section: true, academicYear: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!student) notFound();

  // Build readable labels for the dropdown
  const classSectionOptions = classSections.map(cls => ({
    id: cls.id,
    label: `${cls.gradeLevel.name} — Section ${cls.section.name} (${cls.academicYear.name})`,
    academicYearId: cls.academicYearId,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <Link href="/dashboard/students" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            {student.firstName[0]}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              {student.firstName} {student.middleName || ''} {student.lastName || ''}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {student.admissionNo && <Badge variant="secondary" className="font-mono">{student.admissionNo}</Badge>}
              <Badge className={`${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600'}`}>
                {student.status}
              </Badge>
              {student.gender !== 'NOT_SPECIFIED' && <Badge variant="outline">{student.gender}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Personal Details */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            {[
              ['Date of Birth', student.dateOfBirth?.toLocaleDateString('en-IN') || '—'],
              ['Religion', student.religion || '—'],
              ['Caste', student.caste || '—'],
              ['Category', student.category || '—'],
              ['Nationality', student.nationality || '—'],
              ['Blood Group', student.bloodGroup || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Family Details */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Family Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            {[
              ['Father Name', student.fatherName || '—'],
              ['Father Occupation', student.fatherOccupation || '—'],
              ['Mother Name', student.motherName || '—'],
              ['Mother Occupation', student.motherOccupation || '—'],
              ['Guardian Name', student.guardianName || '—'],
              ['Guardian Phone', student.guardianPhone || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Enrollment History */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Enrollment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {student.enrollments.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">Not enrolled in any class yet.</p>
            ) : (
              <ul className="divide-y">
                {student.enrollments.map(e => (
                  <li key={e.id} className="px-5 py-4">
                    <p className="font-bold text-gray-900">{e.classSection.gradeLevel.name} — Section {e.classSection.section.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{e.classSection.academicYear.name}</span>
                      {e.rollNumber && <span className="text-xs text-gray-400">· Roll #{e.rollNumber}</span>}
                      <Badge className={`text-xs ml-auto ${e.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500'}`}>{e.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Enroll in Class — ADMIN ONLY ACTION */}
        <Card className="shadow-sm border-0 border-l-4 border-l-indigo-500">
          <CardHeader className="bg-indigo-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2 text-indigo-800">
              <GraduationCap className="w-4 h-4" /> Enroll in Class
            </CardTitle>
            <p className="text-xs text-indigo-600 mt-1">Assign this student to a class section for attendance and records.</p>
          </CardHeader>
          <EnrollStudentForm studentId={student.id} classSections={classSectionOptions} />
        </Card>

        {/* Linked Guardians */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Linked Guardians</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {student.guardians.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No guardian accounts linked.</p>
            ) : (
              <ul className="divide-y">
                {student.guardians.map(g => (
                  <li key={g.id} className="px-5 py-4">
                    <p className="font-bold text-gray-900">{g.parent.profile?.firstName} {g.parent.profile?.lastName || ''}</p>
                    <p className="text-xs text-gray-500">{g.parent.email} · {g.relation}</p>
                    <div className="flex gap-2 mt-1">
                      {g.isPrimary && <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">Primary</Badge>}
                      {g.canApplyLeave && <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">Can Apply Leave</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Source Application */}
        {student.sourceApplication && (
          <Card className="shadow-sm border-0 lg:col-span-2">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Source Application</CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{student.sourceApplication.scholarName}</p>
                <p className="text-xs font-mono text-gray-400">{student.sourceApplication.applicationNo}</p>
              </div>
              <Link href={`/dashboard/admissions/${student.sourceApplication.id}`}>
                <button className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-600 transition-all cursor-pointer">
                  View Application →
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}