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
  // Find the active official Admission Form
  const admissionForm = await prisma.formTemplate.findFirst({
    where: { 
      schoolId: user.schoolId!,
      context: 'ADMISSION',
      isActive: true,
      isPublished: true
    }
  });

  const pendingForms = await prisma.formAssignment.findMany({
    where: { 
      assignedToUserId: user.id, 
      schoolId: user.schoolId!,
      isExcluded: false,
      hasSubmitted: false,
      formTemplate: { isPublished: true, isActive: true }
    },
    include: {
      formTemplate: true
    }
  });

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
          {staffProfile?.canManageAdmissions && admissionForm && (
            <Link href={`/dashboard/forms/fill/${admissionForm.id}`}>
              <button className="flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                New Admission
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'My Classes', value: myClasses.length, icon: School, gradient: 'from-indigo-500 to-indigo-700', suffix: 'As Class Teacher' },
          { label: 'Total Students', value: totalStudents, icon: Users, gradient: 'from-purple-500 to-purple-700', suffix: 'In My Classes' },
          { label: 'Applications', value: mySubmissions.length, icon: ClipboardList, gradient: 'from-pink-500 to-rose-600', suffix: `${pendingCount} Pending` },
        ].map(stat => (
          <div key={stat.label} className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.gradient} text-white shadow-md`}>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-4 px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black leading-none">{stat.value}</p>
                <p className="text-sm font-bold text-white/90 mt-0.5">{stat.label}</p>
                <p className="text-xs text-white/60">{stat.suffix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingForms.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h2 className="text-amber-800 font-bold text-base">Action Required: Pending Forms</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingForms.map(assignment => (
              <div key={assignment.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">{assignment.formTemplate.name}</h3>
                  {assignment.formTemplate.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{assignment.formTemplate.description}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    Due: {assignment.formTemplate.closingDate ? new Date(assignment.formTemplate.closingDate).toLocaleDateString() : 'No deadline'}
                  </span>
                  <Link href={`/dashboard/forms/fill/${assignment.formTemplate.id}`}>
                    <button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                      Fill Now →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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