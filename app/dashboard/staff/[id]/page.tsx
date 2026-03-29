import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resetStaffPassword, updateStaffDetails } from '../actions';
import ResetPasswordForm from './ResetPasswordForm';
import UpdateDetailsForm from './UpdateDetailsForm';

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const staffProfile = await prisma.staffProfile.findFirst({
    where: { id: params.id, schoolId: user.schoolId! },
    include: {
      user: { include: { profile: true } }
    }
  });

  if (!staffProfile) notFound();

  const assignedClasses = await prisma.classSection.findMany({
    where: { classTeacherId: staffProfile.userId, schoolId: user.schoolId! },
    include: { gradeLevel: true, section: true, academicYear: true }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl shadow-inner">
          {staffProfile.user.profile?.firstName?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {staffProfile.user.profile?.firstName} {staffProfile.user.profile?.lastName || ''}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{staffProfile.designation}</Badge>
            <Badge variant="secondary" className="font-mono">{staffProfile.employeeCode}</Badge>
            <span className="text-gray-500 text-sm">{staffProfile.user.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Update Details */}
        <UpdateDetailsForm
          staffProfile={staffProfile}
          action={updateStaffDetails}
        />

        {/* Password Reset */}
        <ResetPasswordForm
          staffUserId={staffProfile.userId}
          action={resetStaffPassword}
        />

        {/* Assigned Classes */}
        <Card className="shadow-sm border-0 lg:col-span-2">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-lg">Assigned Classes ({assignedClasses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {assignedClasses.length === 0 ? (
              <p className="text-gray-400 text-center py-10 text-sm">No classes assigned as Class Teacher yet.</p>
            ) : (
              <ul className="divide-y">
                {assignedClasses.map(cls => (
                  <li key={cls.id} className="px-6 py-4 flex items-center gap-4">
                    <span className="font-bold text-gray-900">{cls.gradeLevel.name} — Section {cls.section.name}</span>
                    <span className="text-sm text-gray-500">📅 {cls.academicYear.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}