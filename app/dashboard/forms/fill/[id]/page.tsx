import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, Info } from 'lucide-react';
import FormRenderer from './FormRenderer';

export default async function FillFormPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect('/login');

  const formTemplateId = params.id;

  // 1. Check if form exists
  const form = await prisma.formTemplate.findUnique({
    where: { id: formTemplateId, schoolId: user.schoolId! },
    include: {
      fields: { orderBy: { sortOrder: 'asc' } }
    }
  });

  if (!form || !form.isPublished || !form.isActive) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100 mt-10">
        <h2 className="text-xl font-bold text-gray-900">Form Not Available</h2>
        <p className="text-gray-500 mt-2">This form does not exist or is no longer accepting responses.</p>
        <Link href="/dashboard" className="inline-block mt-6 text-indigo-600 font-bold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

    // 2. Check Permissions & Assignments
  let isAllowed = false;
  let hasAlreadySubmitted = false;
  let isProxySubmission = false; // "Proxy" means a teacher filling on behalf of a student

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    isAllowed = true;
  } else if (user.role === 'TEACHER') {
    // Check if they are an Admissions Officer trying to fill an admission form
    const staffProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (staffProfile?.canManageAdmissions && form.context === 'ADMISSION') {
      isAllowed = true;
      isProxySubmission = true; // They can submit this infinitely
    } else {
      // Standard flow: Check if they were assigned this form (like a staff survey)
      const assignment = await prisma.formAssignment.findUnique({
        where: { formTemplateId_assignedToUserId: { formTemplateId, assignedToUserId: user.id } }
      });
      if (assignment && !assignment.isExcluded) {
        isAllowed = true;
        if (assignment.hasSubmitted) hasAlreadySubmitted = true;
      }
    }
  } else if (user.role === 'PARENT') {
     // Parents can view forms they are assigned (or open admission forms if we allow open links)
     isAllowed = true; // We will handle exact parent assignment logic later
  }

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border mt-10">
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You do not have permission to view or fill this form.</p>
        <Link href="/dashboard" className="mt-6 text-indigo-600 font-bold hover:underline inline-block">Return Home</Link>
      </div>
    );
  }

  if (hasAlreadySubmitted && !isProxySubmission) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border mt-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">✓</div>
        <h2 className="text-xl font-bold text-gray-900">Already Submitted</h2>
        <p className="text-gray-500 mt-2">You have already completed this form. Thank you!</p>
        <Link href="/dashboard" className="mt-6 text-indigo-600 font-bold hover:underline inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Form Header */}
        <div className="bg-indigo-600 px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 10% 90%, #fff 0%, transparent 50%), radial-gradient(circle at 90% 10%, #fff 0%, transparent 50%)'
          }} />
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">{form.name}</h1>
            {form.description && (
              <p className="mt-3 text-indigo-100 leading-relaxed text-sm">{form.description}</p>
            )}
            {form.closingDate && (
              <div className="mt-5 flex items-center gap-2 text-xs font-bold bg-indigo-700/50 inline-flex px-3 py-1.5 rounded-lg border border-indigo-500/30">
                <Info className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-indigo-200">Due Date:</span>
                <span className="text-white">{new Date(form.closingDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 bg-gray-50/50">
          <FormRenderer form={form} />
        </div>
      </div>
    </div>
  );
}
