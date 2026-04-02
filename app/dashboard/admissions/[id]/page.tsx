import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { rejectSubmission } from './actions';
import EnrollmentWizardForm from './EnrollmentWizardForm';

// Helper to pre-guess data for the admin!
function extractGuessedData(data: any) {
  if (!data || typeof data !== 'object') return { firstName: '', lastName: '', email: '' };
  const keys = Object.keys(data);
  const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('student'));
  const first = nameKey ? String(data[nameKey]).split(' ')[0] : '';
  const last = nameKey ? String(data[nameKey]).split(' ').slice(1).join(' ') : '';
  
  const emailKey = keys.find(k => k.toLowerCase().includes('email'));
  const email = emailKey ? String(data[emailKey]) : '';
  
  return { firstName: first, lastName: last, email };
}

export default async function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/dashboard');

  const submission = await prisma.formSubmission.findUnique({
    where: { id: params.id, schoolId: user.schoolId! },
    include: { submittedByUser: { include: { profile: true } } }
  });

  if (!submission) return notFound();

  const customAnswers = (submission.data as Record<string, any>) || {};
  const guesses = extractGuessedData(customAnswers);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <Link href="/dashboard/admissions" className="text-sm font-bold text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Pipeline</Link>
           <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Application Review</h1>
           <p className="text-gray-500 mt-1">
             Submitted On: {new Date(submission.createdAt).toLocaleDateString()} by{' '}
             <span className="font-bold text-gray-700">{submission.submittedByUser?.profile?.firstName || submission.submittedByUser?.email || 'Unknown'}</span>
           </p>
         </div>
         <Badge className={`text-lg px-6 py-2 shadow-sm ${
            submission.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
            submission.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-amber-100 text-amber-800 border-amber-200'
         }`}>
           {submission.status}
         </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: The Custom Data Viewer */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 border-t-4 border-t-blue-600">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 text-2xl">Raw Form Data</CardTitle>
              <CardDescription className="text-blue-700 font-medium mt-1">
                This is exactly what the parent or proxy answered on your custom form.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {Object.keys(customAnswers).length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">Form was submitted completely empty.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {Object.entries(customAnswers).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-4">
                      <p className="text-xs font-bold text-gray-400 mb-1">
                        {key}
                      </p>
                      <p className="font-medium text-gray-900 whitespace-pre-wrap">{String(value) || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: The Mapping Wizard */}
        <div className="lg:col-span-1">
          <Card className="shadow-2xl sticky top-6 border-0 overflow-hidden">
            <CardHeader className="bg-gray-900 text-white p-6">
              <CardTitle>Enrollment Wizard</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gray-50">
              
              {submission.status === 'SUBMITTED' ? (
                <>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Please explicitly confirm the official details below based on the raw answers. Approving this creates a Student record!
                  </p>
                  
                  {/* Client Component Wizard */}
                  <EnrollmentWizardForm submissionId={submission.id} guesses={guesses} />

                  <div className="mt-8 pt-4 border-t border-red-200">
                    <form action={async () => {
                      'use server';
                       await rejectSubmission(submission.id);
                    }}>
                      <button className="w-full text-red-600 hover:text-red-800 font-bold py-2 text-sm transition-colors decoration-solid hover:underline">
                        Or Reject entirely
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-2">Final Decision Logged</p>
                  <p className="text-2xl font-black text-gray-800">{submission.status}</p>
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}