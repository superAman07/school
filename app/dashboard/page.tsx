import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function DashboardHub() {
  const session = await auth();

  // Protect the route natively
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  return (
    <div className="p-10 space-y-6 max-w-4xl mx-auto mt-10 shadow-lg rounded-xl border">
      <h1 className="text-3xl font-bold">Welcome back, {session.user.email}</h1>
      <div className="p-4 bg-gray-50 rounded-lg inline-block font-mono text-sm border font-semibold">
        Active System Role: <span className="text-blue-600">{role}</span>
      </div>

      <div className="text-gray-700 text-lg">
        {role === 'SUPER_ADMIN' && "🏢 You are viewing the global systems control panel. You can manage all tenant schools here."}
        {role === 'ADMIN' && "🏫 Welcome to your School Management Dashboard. You can review new student applications here."}
        {role === 'TEACHER' && "👨‍🏫 Welcome to your class hub. Take attendance and manage student grades here."}
        {role === 'PARENT' && "👨‍👩‍👦 Welcome to the Parent Portal. You can track your child's application status here."}
      </div>

      <div className="pt-10">
        {/* Sign Out Button natively connected to Auth.js Server Action */}
        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}>
          <Button variant="destructive" type="submit">Sign Out Securely</Button>
        </form>
      </div>
    </div>
  );
}
