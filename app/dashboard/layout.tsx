import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Building2, Calendar, BookOpen, School,
  BookMarked, Users, GraduationCap, ClipboardList, Wrench,
  Settings, LogOut, ChevronRight
} from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-black text-white flex flex-col border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <School className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-widest text-blue-400">SCHOOL ERP</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-3 text-sm font-medium">

            {/* Dashboard Home — visible to all */}
            <li>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                <span>Dashboard</span>
              </Link>
            </li>

            {/* SUPER ADMIN */}
            {role === 'SUPER_ADMIN' && (
              <li>
                <Link href="/dashboard/schools" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>Manage Schools</span>
                </Link>
              </li>
            )}

            {/* PARENT */}
            {role === 'PARENT' && (
              <li>
                <Link href="/dashboard/status" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>Child Status</span>
                </Link>
              </li>
            )}

            {/* ADMIN */}
            {role === 'ADMIN' && (
              <>
                {/* ACADEMICS */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 pt-5 pb-1">Academics</li>
                <li>
                  <Link href="/dashboard/academics/years" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Academic Years</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/academics/grades" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>Grades & Sections</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/academics/classes" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <School className="w-4 h-4 text-gray-400" />
                    <span>Class Matrix</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/academics/subjects" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <BookMarked className="w-4 h-4 text-gray-400" />
                    <span>Subjects</span>
                  </Link>
                </li>

                {/* PEOPLE */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 pt-5 pb-1">People</li>
                <li>
                  <Link href="/dashboard/staff" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Staff Directory</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/students" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>Students</span>
                  </Link>
                </li>

                {/* ADMISSIONS */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 pt-5 pb-1">Admissions</li>
                <li>
                  <Link href="/dashboard/admissions" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-blue-400">
                    <ClipboardList className="w-4 h-4" />
                    <span>Applications</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/admissions/form-builder" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-purple-400">
                    <Wrench className="w-4 h-4" />
                    <span>Form Builder</span>
                  </Link>
                </li>

                {/* SETTINGS */}
                <li className="mt-4 border-t border-gray-800 pt-4">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>School Settings</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Bottom: User info + Sign Out */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <p className="text-xs text-gray-400 mb-3 truncate">{session.user.email}</p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 text-white rounded-lg py-2 text-sm transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 shadow-inner md:rounded-l-2xl border-l border-gray-200 dark:border-gray-800">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}