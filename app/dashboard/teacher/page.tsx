import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  School, Users, ClipboardList, ChevronRight,
  PlusCircle, BookOpen, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function TeacherDashboard() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  const staffProfile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    include: { user: { include: { profile: true } } }
  });

  const myClasses = await prisma.classSection.findMany({
    where: { classTeacherId: user.id, schoolId: user.schoolId! },
    include: {
      gradeLevel: true,
      section: true,
      academicYear: true,
      enrollments: { where: { status: 'ACTIVE' } }
    }
  });

  const mySubmissions = await prisma.admissionApplication.findMany({
    where: { submittedByUserId: user.id, schoolId: user.schoolId! },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const totalStudents = myClasses.reduce((acc, cls) => acc + cls.enrollments.length, 0);
  const pendingCount = mySubmissions.filter(a => a.status === 'SUBMITTED').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-900 via-purple-900 to-indigo-900 p-7 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 85% 20%, #c084fc 0%, transparent 50%)'
        }} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Teacher Portal</p>
            <h1 className="text-3xl font-black tracking-tight">
              Hello, {staffProfile?.user.profile?.firstName || user.email?.split('@')[0]}! 👨‍🏫
            </h1>
            <p className="text-indigo-300 mt-1.5">
              {staffProfile?.designation || 'Teacher'} · {staffProfile?.employeeCode || ''}
            </p>
          </div>
          <Link href="/dashboard/teacher/new-admission">
            <button className="flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg cursor-pointer">
              <PlusCircle className="w-4 h-4" />
              New Admission
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'My Classes', value: myClasses.length, icon: School, gradient: 'from-indigo-500 to-indigo-700', suffix: 'As Class Teacher' },
          { label: 'Total Students', value: totalStudents, icon: Users, gradient: 'from-purple-500 to-purple-700', suffix: 'In My Classes' },
          { label: 'Applications Submitted', value: mySubmissions.length, icon: ClipboardList, gradient: 'from-pink-500 to-rose-600', suffix: `${pendingCount} Pending Review` },
        ].map(stat => (
          <div key={stat.label} className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.gradient} px-4 py-3 text-white shadow-md`}>
            <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black leading-none">{stat.value}</p>
                <p className="text-xs font-semibold text-white/80 mt-0.5 truncate">{stat.label}</p>
                <p className="text-xs text-white/60">{stat.suffix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My Assigned Classes */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> My Assigned Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myClasses.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <School className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No classes assigned yet.</p>
                <p className="text-xs mt-1">Ask your admin to assign you as a class teacher.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {myClasses.map(cls => (
                  <li key={cls.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{cls.gradeLevel.name} — Section {cls.section.name}</p>
                      <p className="text-xs text-gray-500">{cls.academicYear.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                        {cls.enrollments.length} Students
                      </Badge>
                      {cls.academicYear.isCurrent && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Current</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* My Submissions */}
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gray-50 border-b p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> My Submitted Applications
            </CardTitle>
            <Link href="/dashboard/teacher/new-admission" className="text-xs text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">
              + New <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No applications submitted yet.</p>
                <p className="text-xs mt-1">Use the "New Admission" button above.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {mySubmissions.map(app => (
                  <li key={app.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {app.scholarName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{app.scholarName}</p>
                        <p className="text-xs text-gray-400 font-mono">{app.applicationNo}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      app.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {app.status}
                    </span>
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