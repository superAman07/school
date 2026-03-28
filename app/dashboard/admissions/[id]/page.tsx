import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { approveApplication, rejectApplication } from './actions';

export default async function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  // Securely fetch the exact application, ensuring it belongs to this specific school
  const application = await prisma.admissionApplication.findUnique({
    where: { id, schoolId: user.schoolId! },
    include: { submittedByUser: true }
  });

  if (!application) return notFound();

  // MAGIC: We parse the dynamic JSON responses that the Parent filled out!
  const customAnswers = (application.extraData as Record<string, string>) || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <Link href="/dashboard/admissions" className="text-sm font-bold text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Pipeline</Link>
           <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Review Application</h1>
           <p className="text-gray-500 mt-1">Application ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{application.applicationNo}</span></p>
         </div>
         <Badge variant={application.status === 'SUBMITTED' ? 'default' : 'secondary'} className="text-lg px-6 py-2 shadow-sm">
           Status: {application.status}
         </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: The Data Viewer */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-0 border-t-4 border-t-gray-800">
            <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle>Core Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Registered Parent Name</p>
                  <p className="font-medium text-xl mt-1 text-gray-900">{application.parentOrGuardianName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Contact Email (Portal ID)</p>
                  <p className="font-medium text-lg mt-1 text-blue-600">{application.contactEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 border-t-4 border-t-blue-600">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 text-2xl">Dynamic Student Responses</CardTitle>
              <CardDescription className="text-blue-700 font-medium mt-1">
                These answers were generated and captured by your custom form engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {Object.keys(customAnswers).length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No custom data was submitted.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(customAnswers).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {/* We reconstruct the internal Database Key back into a human readable title */}
                        {key.replace(/_/g, ' ').replace(/[0-9]/g, '')} 
                      </p>
                      <p className="text-xl font-medium text-gray-900 whitespace-pre-wrap">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: The Action Panel */}
        <div className="md:col-span-1">
          <Card className="shadow-2xl sticky top-6 border-0 overflow-hidden">
            <CardHeader className="bg-gray-900 text-white rounded-t-xl p-6">
              <CardTitle>Final Decision</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gray-50">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Approving this application will automatically convert this raw record into an official secure <b>Student Profile</b> in your database.
              </p>
              
            {application.status === 'SUBMITTED' ? (
                <div className="space-y-3">
                  <form action={async () => {
                    'use server';
                    // We call the function and pass the ID!
                    await approveApplication(application.id);
                  }}>
                    <button className="w-full bg-green-600 hover:bg-green-700 hover:-translate-y-1 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all cursor-pointer">
                      ✅ Approve & Enroll
                    </button>
                  </form>
                  
                  <form action={async () => {
                    'use server';
                     // We call the function and pass the ID!
                     await rejectApplication(application.id);
                  }}>
                    <button className="w-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold py-3 rounded-xl transition-all border-2 border-red-100 hover:border-red-200 cursor-pointer">
                      ❌ Reject Application
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-1">Current Status</p>
                  <p className="text-2xl font-black text-gray-800">{application.status}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
