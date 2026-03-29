import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, User, BookOpen, Users, FileText } from 'lucide-react';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const student = await prisma.student.findFirst({
    where: { id: params.id, schoolId: user.schoolId! },
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
  });

  if (!student) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/students" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl shadow-inner">
            {student.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {student.firstName} {student.middleName || ''} {student.lastName || ''}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {student.admissionNo && <Badge variant="secondary" className="font-mono">{student.admissionNo}</Badge>}
              <Badge className={`${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600'}`}>
                {student.status}
              </Badge>
              {student.gender !== 'NOT_SPECIFIED' && <Badge variant="outline">{student.gender}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            {[
              ['Date of Birth', student.dateOfBirth?.toLocaleDateString() || '—'],
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
                    <p className="text-xs text-gray-500">{e.classSection.academicYear.name} · {e.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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