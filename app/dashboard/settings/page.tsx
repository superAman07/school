import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export default async function SchoolSettingsPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN' || !session?.user?.schoolId) {
    redirect('/dashboard');
  }

  // Fetch the Principal's specific school settings
  const settings = await prisma.schoolSetting.findUnique({
    where: { schoolId: session.user.schoolId }
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">School Settings</h1>
        <p className="text-gray-500 mt-1">Manage global configurations for your entire campus.</p>
      </div>

      {/* We separate the interactive form into a Client Component */}
      <SettingsForm initialStatus={settings?.admissionOpen || false} />
    </div>
  );
}
