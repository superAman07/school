import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Dynamic Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-black text-white flex flex-col border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-widest text-blue-400">SCHOOL ERP</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4 text-sm font-medium">
            <li>
              <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">
                Dashboard Home
              </Link>
            </li>
            
            {/* ONLY Super Admins can see this link */}
            {role === 'SUPER_ADMIN' && (
              <li>
                <Link href="/dashboard/schools" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">
                  🏢 Manage Schools
                </Link>
              </li>
            )}
            
            {/* The Parent Links */}
            {role === 'PARENT' && (
              <li><Link href="/dashboard/status" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">Child Status</Link></li>
            )}

            {role === 'ADMIN' && (
              <>
                {/* ACADEMICS */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 pt-4 pb-1">Academics</li>
                <li><Link href="/dashboard/academics/years" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">📅 Academic Years</Link></li>
                <li><Link href="/dashboard/academics/grades" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">📚 Grades & Sections</Link></li>
                <li><Link href="/dashboard/academics/subjects" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">📖 Subjects</Link></li>
                
                {/* PEOPLE */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 pt-4 pb-1">People</li>
                <li><Link href="/dashboard/teachers" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">👨‍🏫 Staff Directory</Link></li>
                <li><Link href="/dashboard/students" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition">🎓 Students</Link></li>

                {/* ADMISSIONS */}
                <li className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 pt-4 pb-1">Admissions</li>
                <li><Link href="/dashboard/admissions" className="block px-4 py-2 text-blue-400 hover:bg-gray-800 rounded-md transition">📝 Applications</Link></li>
                <li><Link href="/dashboard/admissions/form-builder" className="block px-4 py-2 text-purple-400 hover:bg-gray-800 rounded-md transition font-bold">🛠️ Form Builder</Link></li>
                
                {/* SETTINGS */}
                <li><Link href="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-800 rounded-md transition mt-4 border-t border-gray-800 pt-4">⚙️ School Settings</Link></li>
              </>
            )}
          </ul>
        </nav>
        
        {/* User Profile & Logout section at the bottom of the sidebar */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <p className="text-xs text-gray-400 mb-2 truncate">{session.user.email}</p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <button type="submit" className="w-full bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 text-white rounded-md py-2 text-sm transition">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area where your pages render */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 shadow-inner md:rounded-l-2xl border-l border-gray-200 dark:border-gray-800">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}