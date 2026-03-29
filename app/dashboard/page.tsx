import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  ClipboardList,
  Settings,
  School,
  BookMarked,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardHome() {
  const session = await auth();

  if (!session?.user) redirect('/login');

  const user = session.user as any;
  const role = user.role;

  if (role === 'PARENT') redirect('/dashboard/status');
  if (role === 'SUPER_ADMIN') redirect('/dashboard/schools');

  const [students, staff, pendingApps, approvedApps, classes, subjects] =
    await Promise.all([
      prisma.student.count({ where: { schoolId: user.schoolId! } }),
      prisma.staffProfile.count({ where: { schoolId: user.schoolId! } }),
      prisma.admissionApplication.count({
        where: { schoolId: user.schoolId!, status: 'SUBMITTED' },
      }),
      prisma.admissionApplication.count({
        where: { schoolId: user.schoolId!, status: 'APPROVED' },
      }),
      prisma.classSection.count({ where: { schoolId: user.schoolId! } }),
      prisma.subject.count({ where: { schoolId: user.schoolId! } }),
    ]);

  const recentApplications = await prisma.admissionApplication.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const stats = [
    {
      label: 'Total Students',
      value: students,
      icon: GraduationCap,
      gradient: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-200',
      href: '/dashboard/students',
      suffix: 'Enrolled',
    },
    {
      label: 'Staff Members',
      value: staff,
      icon: Users,
      gradient: 'from-violet-500 to-purple-700',
      shadow: 'shadow-violet-200',
      href: '/dashboard/staff',
      suffix: 'Faculty',
    },
    {
      label: 'Pending Applications',
      value: pendingApps,
      icon: ClipboardList,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-200',
      href: '/dashboard/admissions',
      suffix: 'Need Review',
    },
    {
      label: 'Classes',
      value: classes,
      icon: School,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
      href: '/dashboard/academics/classes',
      suffix: 'Configured',
    },
    {
      label: 'Subjects',
      value: subjects,
      icon: BookMarked,
      gradient: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-200',
      href: '/dashboard/academics/subjects',
      suffix: 'Taught',
    },
    {
      label: 'Total Admissions',
      value: approvedApps,
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-sky-600',
      shadow: 'shadow-cyan-200',
      href: '/dashboard/admissions',
      suffix: 'Approved',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-8 text-white shadow-xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)',
          }}
        />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-2">
              Principal&apos;s Control Panel
            </p>
            <h1 className="text-4xl font-black tracking-tight">Welcome Back! 👋</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Here&apos;s a live snapshot of your school today.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Logged in as
            </p>
            <p className="text-sm font-semibold text-gray-300 mt-1">{user.email}</p>
            <span className="inline-block mt-2 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid — 6 cards, single row, horizontal layout */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div
              className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.gradient} px-4 py-3 text-white shadow-md ${stat.shadow} hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer group`}
            >
              {/* Subtle bg bubble */}
              <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-white/10" />

              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-none">{stat.value}</p>
                  <p className="text-xs font-semibold text-white/80 mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Row: Recent Apps + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications — takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Applications</CardTitle>
              <Link
                href="/dashboard/admissions"
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentApplications.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No applications yet</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {recentApplications.map((app) => (
                    <Link key={app.id} href={`/dashboard/admissions/${app.id}`}>
                      <li className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {app.scholarName[0]}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {app.scholarName}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {app.applicationNo}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              app.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : app.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700'
                                  : app.status === 'SUBMITTED'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {app.status}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions — takes 1/3 width */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3 text-sm">Quick Actions</h2>

          <div className="space-y-3">
            {[
              {
                label: 'Add New Staff',
                href: '/dashboard/staff',
                icon: Users,
                color:
                  'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100',
              },
              {
                label: 'Review Applications',
                href: '/dashboard/admissions',
                icon: ClipboardList,
                color:
                  'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
              },
              {
                label: 'Manage Classes',
                href: '/dashboard/academics/classes',
                icon: School,
                color:
                  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
              },
              {
                label: 'School Settings',
                href: '/dashboard/settings',
                icon: Settings,
                color:
                  'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
              },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div
                  className={`border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all mb-3 ${action.color}`}
                >
                  <action.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-bold">{action.label}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}