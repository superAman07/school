import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user as any;

  return (
    <DashboardSidebar userEmail={user.email || ''} role={user.role || 'ADMIN'}>
      {children}
    </DashboardSidebar>
  );
}