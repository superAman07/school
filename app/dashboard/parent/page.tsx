import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { User, Calendar, FileText, Activity, Users, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function ParentDashboard() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'PARENT') redirect('/dashboard');

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  // Get enrolled children mapped to this parent account
  const childrenRecords = await prisma.studentGuardian.findMany({
    where: { parentId: user.id, schoolId: user.schoolId! },
    include: {
      student: {
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            include: { classSection: { include: { gradeLevel: true, section: true } } }
          },
          attendanceRecords: {
            orderBy: { session: { sessionDate: 'desc' } },
            take: 5,
            include: { session: true }
          },
          leaveRequests: {
             orderBy: { createdAt: 'desc' },
             take: 3
          }
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 via-indigo-900 to-purple-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 100% 100%, #a855f7 0%, transparent 50%)'
        }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-2">Secure Parent Portal</p>
            <h1 className="text-4xl font-black tracking-tight">
              Welcome, {profile?.firstName || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-indigo-200 mt-2 text-lg font-medium">
              Track your child's academic journey, attendance, and requests all in one place.
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/dashboard/parent/leave-apply">
                <button className="bg-white hover:bg-blue-50 text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer">
                   <Send className="w-5 h-5" /> Apply for Leave
                </button>
             </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-indigo-600" />
          My Enrolled Children
        </h2>
        
        {childrenRecords.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl py-16 text-center shadow-inner">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No children linked to your account.</h3>
            <p className="text-gray-500 mt-2">If you recently submitted an admission application, it may still be under review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childrenRecords.map(record => {
              const std = record.student;
              const activeEnr = std.enrollments[0]; // Primary active enrollment
              
              return (
                <Card key={std.id} className="shadow-xl border-0 overflow-hidden group">
                  <div className="h-4 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
                  <CardHeader className="bg-white border-b border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner">
                          {std.firstName[0]}
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
                            {std.firstName} {std.lastName || ''}
                          </CardTitle>
                          {activeEnr ? (
                            <p className="text-sm font-bold text-indigo-600 mt-1">
                              {activeEnr.classSection.gradeLevel.name} - Section {activeEnr.classSection.section.name} • Roll No: {activeEnr.rollNumber || 'N/A'}
                            </p>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 mt-1">Not Currently Enrolled</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-gray-50/50">
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      
                      {/* Attendance Summary Panel */}
                      <div className="p-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-gray-400" /> Recent Attendance
                        </h4>
                        {std.attendanceRecords.length === 0 ? (
                           <p className="text-sm text-gray-500 italic">No recent attendance logged.</p>
                        ) : (
                           <ul className="space-y-3">
                             {std.attendanceRecords.map(att => (
                               <li key={att.id} className="flex items-center justify-between text-sm bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                                 <span className="font-bold text-gray-600">
                                   {new Date(att.session.sessionDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                                 </span>
                                 <Badge className={
                                   att.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                   att.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                   'bg-amber-100 text-amber-700'
                                 }>
                                   {att.status}
                                 </Badge>
                               </li>
                             ))}
                           </ul>
                        )}
                      </div>

                      {/* Leaves Summary Panel */}
                      <div className="p-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <FileText className="w-4 h-4 text-gray-400" /> Recent Leave Requests
                        </h4>
                         {std.leaveRequests.length === 0 ? (
                           <p className="text-sm text-gray-500 italic">No leaves requested.</p>
                        ) : (
                           <ul className="space-y-3">
                             {std.leaveRequests.map(lv => (
                               <li key={lv.id} className="flex flex-col text-sm bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                                 <div className="flex justify-between items-center w-full">
                                   <span className="font-bold text-gray-900 border-b pb-1 mb-1 border-gray-50">{lv.leaveType || 'General'}</span>
                                   <Badge className={
                                     lv.status === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                     lv.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                     'bg-gray-100 text-gray-600 hover:bg-gray-100'
                                   }>
                                     {lv.status}
                                   </Badge>
                                 </div>
                                 <div className="text-xs text-gray-500 mt-1">
                                   {lv.fromDate.toLocaleDateString()} to {lv.toDate.toLocaleDateString()}
                                 </div>
                               </li>
                             ))}
                           </ul>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
