'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutAction } from './actions';
import {
  LayoutDashboard, Building2, Calendar, BookOpen, School,
  BookMarked, Users, GraduationCap, ClipboardList, Wrench,
  Settings, LogOut, Menu, X, PlusCircle, ChevronRight
} from 'lucide-react';

export default function DashboardSidebar({
  children, userEmail, role
}: {
  children: React.ReactNode;
  userEmail: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  const NavLink = ({ href, icon: Icon, label, accent }: {
    href: string; icon: any; label: string; accent?: string;
  }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium w-full
        ${isActive(href)
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
          : `hover:bg-gray-800/80 ${accent || 'text-gray-300'}`
        }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {isActive(href) && <ChevronRight className="w-3 h-3 opacity-50" />}
    </Link>
  );

  const Label = ({ text }: { text: string }) => (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 pt-5 pb-1.5">{text}</p>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <School className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-widest text-blue-400">SCHOOL ERP</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">

          {/* TEACHER */}
          {role === 'TEACHER' && (
            <>
              <NavLink href="/dashboard/teacher" icon={LayoutDashboard} label="My Dashboard" />
              <Label text="Classroom" />
              <NavLink href="/dashboard/teacher/attendance" icon={ClipboardList} label="Mark Attendance" accent="text-green-300" />
              <Label text="Admissions" />
              <NavLink href="/dashboard/teacher/new-admission" icon={PlusCircle} label="New Admission" accent="text-indigo-300" />
            </>
          )}

          {/* ADMIN */}
          {role === 'ADMIN' && (
            <>
              <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <Label text="Academics" />
              <NavLink href="/dashboard/academics/years" icon={Calendar} label="Academic Years" />
              <NavLink href="/dashboard/academics/grades" icon={BookOpen} label="Grades & Sections" />
              <NavLink href="/dashboard/academics/classes" icon={School} label="Class Matrix" />
              <NavLink href="/dashboard/academics/subjects" icon={BookMarked} label="Subjects" />
              <Label text="People" />
              <NavLink href="/dashboard/staff" icon={Users} label="Staff Directory" />
              <NavLink href="/dashboard/students" icon={GraduationCap} label="Students" />
              <Label text="Admissions" />
              <NavLink href="/dashboard/admissions" icon={ClipboardList} label="Applications" accent="text-blue-400" />
              <NavLink href="/dashboard/admissions/form-builder" icon={Wrench} label="Form Builder" accent="text-purple-400" />
              <div className="border-t border-gray-800 mt-3 pt-3">
                <NavLink href="/dashboard/settings" icon={Settings} label="School Settings" />
              </div>
            </>
          )}

          {/* SUPER ADMIN */}
          {role === 'SUPER_ADMIN' && (
            <NavLink href="/dashboard/schools" icon={Building2} label="Manage Schools" />
          )}

          {/* PARENT */}
          {role === 'PARENT' && (
            <NavLink href="/dashboard/status" icon={GraduationCap} label="Child Status" />
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userEmail?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-300 truncate font-medium">{userEmail}</p>
              <p className="text-xs text-gray-500 capitalize">{role.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 text-white rounded-xl py-2.5 text-sm transition-all cursor-pointer font-medium">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <School className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-blue-700 tracking-wider text-sm">SCHOOL ERP</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}