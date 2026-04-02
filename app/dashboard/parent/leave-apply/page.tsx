import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ParentLeaveForm from './Form';

export default async function ApplyLeavePage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'PARENT') redirect('/dashboard');

  const childrenRecords = await prisma.studentGuardian.findMany({
    where: { parentId: user.id, schoolId: user.schoolId! },
    include: { student: true }
  });

  if (childrenRecords.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        You must have an enrolled student to apply for leaves.
      </div>
    );
  }

  const mappedStudents = childrenRecords.map(r => ({
    id: r.student.id,
    name: `${r.student.firstName} ${r.student.lastName || ''}`.trim()
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/dashboard/parent" className="hover:text-indigo-600 transition flex items-center">
           <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Apply for Leave</span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Request Absence</h1>
        <p className="text-gray-500 mt-2 text-lg">Your child's Class Teacher will review and approve this leave directly.</p>
      </div>

      <ParentLeaveForm students={mappedStudents} />

    </div>
  );
}
