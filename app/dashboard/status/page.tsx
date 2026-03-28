import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function ParentPortalPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'PARENT') redirect('/dashboard');

  // 1. Fetch pending/past applications submitted specifically by this Parent
  const applications = await prisma.admissionApplication.findMany({
    where: { submittedByUserId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { school: true }
  });

  // 2. Fetch officially enrolled student records linked to this Parent
  const linkedChildren = await prisma.studentGuardian.findMany({
    where: { parentId: user.id },
    include: { 
      student: { include: { school: true } } 
    }
  });

  return (
        <div className= "max-w-6xl mx-auto space-y-8" >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" > Parent Portal </h1>
            < p className = "text-gray-500 text-lg mt-1" > Track your pending applications and manage your enrolled children.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COMPARTMENT: The Sandbox (Applications) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 text-gray-800">Admission Tracking</h2>
          
          {applications.length === 0 ? (
             <p className="text-gray-500 italic p-4">No applications found.</p>
          ) : (
            applications.map(app => (
              <Card key={app.id} className="shadow-sm border-0 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900">{app.scholarName || 'Student Name Pending'}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{app.school?.name}</CardDescription>
                    </div>
                    <Badge variant={app.status === 'APPROVED' ? 'default' : 'secondary'} className={`px-3 py-1 text-sm ${app.status === 'APPROVED' ? 'bg-green-600' : ''}`}>
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 text-sm text-gray-600 space-y-2">
                  <p className="flex justify-between"><span>Reference ID:</span> <span className="font-mono bg-gray-100 px-2 rounded">{app.applicationNo}</span></p>
                  <p className="flex justify-between"><span>Submitted On:</span> <span className="font-semibold">{app.createdAt.toLocaleDateString()}</span></p>
                  
                  {app.status === 'REJECTED' && (
                     <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
                       We regret to inform you that this application was not selected for enrollment.
                     </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* RIGHT COMPARTMENT: The Database Truth (Enrolled Students) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 text-gray-800">Enrolled Children</h2>
          
          {linkedChildren.length === 0 ? (
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-8 text-center text-blue-800 shadow-inner">
               <p className="font-bold text-lg mb-2">No active enrollments yet.</p>
               <p className="text-sm">Once the school Principal approves your application on their dashboard, your child will automatically magically appear right here!</p>
             </div>
          ) : (
            linkedChildren.map(link => (
              <Card key={link.id} className="shadow-xl border-0 border-t-4 border-t-green-500 bg-gradient-to-b from-green-50 to-white overflow-hidden">
                <CardHeader className="p-6">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 w-fit mb-3">OFFICIALLY ENROLLED</Badge>
                  <CardTitle className="text-2xl text-green-900">🎓 {link.student.firstName}</CardTitle>
                  <CardDescription className="text-green-700 font-bold">{link.student.school.name}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                  <p className="text-sm text-gray-600">This student record is now actively linked to your parent portal. You can now engage with school services.</p>
                  
                  <div className="flex justify-between text-sm items-center border-t border-green-100 mt-4 pt-4">
                     <span className="font-bold text-gray-500 uppercase tracking-wider text-xs">Action Center</span>
                     <button className="text-green-700 font-bold hover:underline cursor-pointer">
                        Apply for Leave &rarr;
                     </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}