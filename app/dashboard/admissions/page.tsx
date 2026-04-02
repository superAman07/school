import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, CheckCircle2, XCircle, ChevronRight, Search } from 'lucide-react';

// Helper to "guess" the parent/student name out of completely custom JSON data
function guessName(data: any): string {
  if (!data || typeof data !== 'object') return 'Unknown Applicant';
  const keys = Object.keys(data);
  const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('student'));
  return nameKey ? String(data[nameKey]) : 'Unknown Applicant';
}

function guessPhone(data: any): string {
  if (!data || typeof data !== 'object') return '';
  const keys = Object.keys(data);
  const phoneKey = keys.find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile') || k.toLowerCase().includes('contact'));
  return phoneKey ? String(data[phoneKey]) : '';
}

export default async function AdmissionsPipelinePage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/dashboard'); // We will add Admissions Officer RBAC here later

  // 1. Find the official Application Form Template
  const admissionForm = await prisma.formTemplate.findFirst({
    where: { schoolId: user.schoolId!, context: 'ADMISSION', isActive: true, isPublished: true }
  });

  // 2. Fetch all generic form submissions for this template
  let submissions: any[] = [];
  if (admissionForm) {
    submissions = await prisma.formSubmission.findMany({
      where: { schoolId: user.schoolId!, templateId: admissionForm.id },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedByUser: { include: { profile: true } }
      }
    });
  }

  // Count metrics
  const pendingCount = submissions.filter(s => s.status === 'SUBMITTED').length;
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            Admissions Pipeline
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Review and process student applications.</p>
        </div>
        {admissionForm ? (
          <Link href={`/dashboard/forms/fill/${admissionForm.id}`}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors">
              + Proxy Admission Entry
            </button>
          </Link>
        ) : (
          <Badge variant="destructive" className="py-2 px-4 shadow-sm">No Active Admission Form Found</Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex justify-center items-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pending Review</p>
            <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex justify-center items-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Enrolled / Approved</p>
            <p className="text-2xl font-black text-gray-900">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex justify-center items-center text-indigo-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Applications</p>
            <p className="text-2xl font-black text-gray-900">{submissions.length}</p>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gray-50 border-b p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Applications</CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!admissionForm ? (
            <div className="text-center py-20">
              <p className="text-gray-500">You must create a Form in the Form Builder and set its context to ADMISSION.</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20 px-4">
               <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No admission applications received yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500">Applicant (Guessed)</th>
                  <th className="px-6 py-4 font-bold text-gray-500">Contact</th>
                  <th className="px-6 py-4 font-bold text-gray-500">Submitted By</th>
                  <th className="px-6 py-4 font-bold text-gray-500">Date Received</th>
                  <th className="px-6 py-4 font-bold text-gray-500">Status</th>
                  <th className="px-6 py-4 font-bold text-right text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map(sub => {
                   const guessedName = guessName(sub.data);
                   const guessedPhone = guessPhone(sub.data);
                   return (
                    <tr key={sub.id} className="hover:bg-indigo-50/50 transition cursor-pointer group">
                      <td className="px-6 py-4 font-bold text-gray-900">{guessedName}</td>
                      <td className="px-6 py-4 text-gray-500">{guessedPhone || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                             {sub.submittedByUser?.profile?.firstName?.[0] || 'P'}
                          </div>
                          <span className="text-xs text-gray-600">
                             {sub.submittedByUser?.profile?.firstName || 'Parent'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                          <Badge className={`${
                            sub.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            sub.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-gray-100 text-gray-800'
                          } shadow-sm border`}>
                            {sub.status === 'SUBMITTED' ? 'Needs Review' : sub.status}
                          </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/admissions/${sub.id}`}>
                           <button className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                             Review <ChevronRight className="w-4 h-4" />
                           </button>
                        </Link>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}