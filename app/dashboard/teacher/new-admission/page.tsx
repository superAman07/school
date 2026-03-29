import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { FormContext } from '@prisma/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TeacherAdmissionForm from './TeacherAdmissionForm';

export default async function StaffNewAdmissionPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  // Load the school's active ADMISSION form template (same as public apply page)
  const formTemplate = await prisma.formTemplate.findFirst({
    where: {
      schoolId: user.schoolId!,
      context: FormContext.ADMISSION,
      isActive: true,
      deletedAt: null,
    },
    include: {
      fields: { orderBy: { sortOrder: 'asc' } }
    }
  });

  const dynamicFields = formTemplate?.fields || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/teacher" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">New Admission</h1>
        <p className="text-gray-500 mt-1">Fill in the student details for the walk-in parent. Admin will review and approve.</p>
      </div>

      {dynamicFields.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-gray-400 font-medium text-base">
              No admission form configured yet.
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              Ask your admin to build the admission form from the <strong>Form Builder</strong> section first.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <TeacherAdmissionForm dynamicFields={dynamicFields as any[]} templateId={formTemplate!.id} />
      )}
    </div>
  );
}