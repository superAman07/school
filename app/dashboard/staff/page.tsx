import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddStaffForm from './AddStaffForm';
import Link from 'next/link';
import BulkPermissionsModal from './BulkPermissionsModal';

export default async function StaffDirectoryPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const staff = await prisma.staffProfile.findMany({
    where: { schoolId: user.schoolId! },
    include: {
      user: {
        include: { profile: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Staff Directory</h1>
          <p className="text-gray-500 mt-2 text-lg">Create and manage teacher accounts and faculty roles.</p>
        </div>
        <BulkPermissionsModal staff={staff} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-lg">All Staff ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {staff.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <p className="text-gray-500 font-medium">No staff members added yet.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {staff.map(s => (
                    <Link href={`/dashboard/staff/${s.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50 transition cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                          {s.user.profile?.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {s.user.profile?.firstName} {s.user.profile?.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-500">{s.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-mono text-xs">{s.employeeCode}</Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">{s.designation}</Badge>
                      </div>
                    </Link>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <AddStaffForm />
        </div>
      </div>
    </div>
  );
}
