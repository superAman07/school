import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchoolStatus } from '@prisma/client';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function ManageSchoolsPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all schools AND smartly include the Principal's email!
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      users: {
        where: { role: 'ADMIN' },    // Only fetch the school's Admin account
        select: { email: true }      // We specifically only want the email for security
      }
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Tenant Schools</h1>
          <p className="text-gray-500 mt-1">View and onboard new client schools to your SaaS platform.</p>
        </div>
        <Link href="/dashboard/schools/create">
           <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md font-medium transition w-full md:w-auto">
               + Onboard New School
           </button>
        </Link>
      </div>

      {/* Grid of Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schools.map(school => {
          // Safely grab the first user from the array (which represents the Principal)
          const principalEmail = school.users[0]?.email || 'No Principal Assigned';
          
          return (
            <Card key={school.id} className="hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100 mb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl truncate">{school.name}</CardTitle>
                  <Badge variant={school.status === SchoolStatus.ACTIVE ? "default" : "destructive"}>
                    {school.status}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">Code: {school.code}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p className="flex items-center gap-2">🏙️ <span className="font-medium text-gray-900">{school.city || 'N/A'}</span></p>
                  <p className="flex items-center gap-2">📧 <span className="font-semibold text-blue-600 break-all">{principalEmail}</span></p>
                  <p className="flex items-center gap-2">📅 <span>Joined: {school.createdAt.toLocaleDateString()}</span></p>
                </div>
                
                {/* 
                  This button is a placeholder but will eventually allow Super Admin 
                  to freeze the school or reset the principal's password. 
                */}
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition">
                  Manage Tenant &rarr;
                </button>
              </CardContent>
            </Card>
          );
        })}
        
        {schools.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-16 border-2 border-dashed rounded-xl">
            No schools have been onboarded yet.
          </p>
        )}
      </div>
    </div>
  );
}
