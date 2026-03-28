import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdmissionsDashboard() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  // We query all admission applications linked exactly to this Principal's school
  const applications = await prisma.admissionApplication.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { createdAt: 'desc' },
    include: {
      submittedByUser: { select: { email: true } }
    }
  });

  return (
    <div className="max-w-6xl space-y-8">
      <div>
         <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admissions Pipeline</h1>
         <p className="text-gray-500 mt-2 text-lg">Review, approve, or reject incoming student enrollment requests.</p>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-900 text-white p-6">
          <CardTitle className="text-2xl">Recent Applications ({applications.length})</CardTitle>
          <CardDescription className="text-gray-400 block font-medium">All data here is dynamically pulled from your custom application forms.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
             <div className="text-center py-16 px-4">
                <p className="text-gray-500 text-lg font-medium">No parent applications have been submitted yet.</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse whitespace-nowrap">
                 <thead>
                   <tr className="border-b text-sm font-bold text-gray-700 bg-gray-100 uppercase tracking-wider">
                     <th className="p-5">App ID</th>
                     <th className="p-5">Date Submitted</th>
                     <th className="p-5">Guardian Email</th>
                     <th className="p-5">Status</th>
                     <th className="p-5">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {applications.map(app => (
                     <tr key={app.id} className="border-b hover:bg-blue-50 transition-colors">
                       <td className="p-5 font-mono text-gray-600 bg-gray-50">{app.applicationNo}</td>
                       <td className="p-5 font-medium">{app.createdAt.toLocaleDateString()}</td>
                       <td className="p-5 font-bold text-blue-700">{app.submittedByUser?.email || app.contactEmail}</td>
                       <td className="p-5">
                         <Badge variant={app.status === 'SUBMITTED' ? 'default' : 'secondary'} className="px-3 py-1">
                           {app.status}
                         </Badge>
                       </td>
                       <td className="p-5">
                         <Link href={`/dashboard/admissions/${app.id}`}>
                           <button className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg border border-blue-600 transition-all cursor-pointer">
                             Review Full Data &rarr;
                           </button>
                         </Link>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
