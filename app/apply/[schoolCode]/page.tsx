import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdmissionForm from './AdmissionForm';

export default async function SchoolAdmissionPage({ params }: { params: Promise<{ schoolCode: string }> }) {
  // In Next.js 15+, dynamic params are Promises
  const { schoolCode } = await params;

  // Verify the school exists and is accepting admissions
  const school = await prisma.school.findUnique({
    where: { code: schoolCode },
    include: { settings: true }
  });

  // If the school code is invalid or admissions are closed, show a 404
  if (!school || !school.settings?.admissionOpen) {
    return notFound(); 
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{school.name}</h1>
          <p className="text-gray-500 mt-3 text-lg">Official Admission Portal for Academic Year 2026</p>
        </div>

        <Card className="w-full shadow-2xl border-0 rounded-xl">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl p-6 md:p-8">
            <CardTitle className="text-2xl">New Student Application</CardTitle>
            <CardDescription className="text-blue-100 text-base mt-2">
              Please submit accurate demographic mapping for both Guardian and Student endpoints. 
              Upon approval, track your status via your Parent Portal.
            </CardDescription>
          </CardHeader>
          
          <AdmissionForm schoolCode={school.code} />
        </Card>
      </div>
    </div>
  );
}
