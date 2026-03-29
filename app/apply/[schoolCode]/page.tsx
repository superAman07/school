import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormContext } from '@prisma/client';
import AdmissionForm from './AdmissionForm';

export default async function SchoolAdmissionPage({ params }: { params: Promise<{ schoolCode: string }> }) {
  const { schoolCode } = await params;

  // Massively optimized Prisma query to grab the school AND its entire form template fields
  const school = await prisma.school.findUnique({
    where: { code: schoolCode },
    include: {
      settings: true,
      formTemplates: {
        where: { context: FormContext.ADMISSION },
        include: { fields: { orderBy: { sortOrder: 'asc' } } }
      }
    }
  });

  if (!school || !school.settings?.admissionOpen) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
         <h1 className="text-3xl font-bold text-gray-700">🛑 Admissions are currently closed for {school?.name || 'this institution'}.</h1>
       </div>
    );
  }

  // Graceful fallback if the Principal hasn't built any dynamic fields yet
  const dynamicFields = school.formTemplates[0]?.fields || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-8 space-y-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3 py-1 text-sm font-semibold tracking-wide">
            OFFICIAL ADMISSION PORTAL
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">{school.name}</h1>
          <p className="text-gray-500 text-lg">Parent Admission Portal for Academic Year 2026</p>
        </div>

        <Card className="w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-8">
            <CardTitle className="text-3xl font-bold">New Student Application</CardTitle>
            <CardDescription className="text-blue-100 mt-2 text-base block font-medium">
              Please complete all required fields below. Your secure parent dashboard credentials will be generated automatically upon successful submission.
            </CardDescription>
          </CardHeader>
          
          {/* We hand the dynamic fields directly into the specialized Form builder! */}
          <AdmissionForm schoolCode={school.code} dynamicFields={dynamicFields as any[]} />
        </Card>
      </div>
    </div>
  );
}

// Simple missing component fallback
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full ${className}`}>{children}</span>
}
