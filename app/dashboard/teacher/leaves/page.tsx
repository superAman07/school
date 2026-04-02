import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import LeaveActionBox from './LeaveActionBox';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronLeft, FileText, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function TeacherLeavesPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  // Find all students this teacher is historically in charge of
  const myClasses = await prisma.classSection.findMany({
    where: { classTeacherId: user.id },
    select: { enrollments: { select: { studentId: true } } }
  });

  const myStudentIds = myClasses.flatMap(c => c.enrollments.map(e => e.studentId));

  const leaves = await prisma.leaveRequest.findMany({
    where: { studentId: { in: myStudentIds }, schoolId: user.schoolId! },
    include: { 
      student: true, 
      requestedByUser: { include: { profile: true } },
      reviewedByUser: { include: { staffProfile: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const pastLeaves = leaves.filter(l => l.status !== 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/dashboard/teacher" className="hover:text-indigo-600 transition flex items-center">
           <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Leave Approvals</span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <CalendarClock className="w-8 h-8 text-amber-500" />
          Leave Requests
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Review and action absent notices submitted by parents for your students.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 border-b pb-2">Pending Action ({pendingLeaves.length})</h2>
        {pendingLeaves.length === 0 ? (
          <div className="bg-gray-50 py-12 text-center rounded-2xl border border-gray-100">
            <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No pending leave requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLeaves.map(leave => (
              <Card key={leave.id} className="shadow-sm border-amber-200 overflow-hidden relative pt-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900">{leave.student?.firstName} {leave.student?.lastName || ''}</h3>
                      <p className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {leave.leaveType || 'General Leave'}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-none shadow-sm">PENDING</Badge>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p><strong>From:</strong> {leave.fromDate.toLocaleDateString()}</p>
                    <p><strong>To:</strong> {leave.toDate.toLocaleDateString()}</p>
                    <p className="bg-gray-50 p-2 rounded-lg text-gray-800 italic text-xs mt-2 border">"{leave.reason}"</p>
                    <p className="text-xs text-gray-400 mt-1 pb-2 border-b">Applied by {leave.requestedByUser.profile?.firstName} (Parent)</p>
                  </div>

                  <LeaveActionBox leaveId={leave.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-black text-gray-900 border-b pb-2">Past Decisions</h2>
        {pastLeaves.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No historical leaf records.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition">
            {pastLeaves.map(leave => (
              <Card key={leave.id} className="shadow-none border border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-900">{leave.student?.firstName} {leave.student?.lastName || ''}</h3>
                    <Badge className={
                      leave.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-none' : 
                      'bg-red-100 text-red-800 border-none'
                    }>
                      {leave.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <p>{leave.fromDate.toLocaleDateString()} to {leave.toDate.toLocaleDateString()}</p>
                    {leave.decisionNote && (
                      <p className="mt-2 bg-white border p-2 rounded text-indigo-700 italic">
                        <strong>My Note:</strong> {leave.decisionNote}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
