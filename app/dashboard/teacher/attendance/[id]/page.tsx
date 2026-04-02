import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, Calendar as CalendarIcon, Users } from 'lucide-react';
import AttendanceGrid from './AttendanceGrid';

// Get today's local date in YYYY-MM-DD securely
const getTodayStr = () => {
  const d = new Date();
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default async function AttendancePage({ params, searchParams }: any) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') redirect('/dashboard');

  const classSectionId = params.id;
  const dateStr = searchParams.date || getTodayStr();

  const classSec = await prisma.classSection.findUnique({
    where: { id: classSectionId, schoolId: user.schoolId! },
    include: {
      gradeLevel: true,
      section: true,
      academicYear: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { student: true },
        orderBy: [{ rollNumber: 'asc' }, { student: { firstName: 'asc' } }]
      }
    }
  });

  if (!classSec) return <div className="p-10 text-center text-red-500 font-bold">Class not found or unauthorized.</div>;

  // Map Data
  const mappedStudents = classSec.enrollments.map(enr => ({
    enrollmentId: enr.id,
    studentId: enr.student.id,
    firstName: enr.student.firstName,
    lastName: enr.student.lastName,
    rollNumber: enr.rollNumber,
    photoUrl: enr.student.photoUrl
  }));

  // Fetch any existing records for this day (to seamlessly support edits later)
  const dateObj = new Date(dateStr);
  dateObj.setHours(0,0,0,0);

  const prevSession = await prisma.attendanceSession.findFirst({
    where: { classSectionId, sessionDate: dateObj, periodName: null },
    include: { attendanceRecords: true }
  });

  const prevRecords = prevSession ? prevSession.attendanceRecords.map(r => ({
    enrollmentId: r.enrollmentId,
    status: r.status,
    remark: r.remark
  })) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/dashboard/teacher" className="hover:text-indigo-600 transition flex items-center">
           <ChevronLeft className="w-4 h-4" /> Back to Teachers Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mark Attendance</span>
      </div>

      <div className="bg-indigo-900 border border-indigo-800 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 10% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 90% 20%, #c084fc 0%, transparent 50%)'
        }} />

        <div className="relative z-10">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1.5">Class Register</p>
          <h1 className="text-3xl font-black tracking-tight">{classSec.gradeLevel.name} - Section {classSec.section.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-indigo-100">
             <span className="flex items-center gap-1.5 font-bold"><Users className="w-4 h-4"/> {mappedStudents.length} Enrolled</span>
             <span className="flex items-center gap-1.5 font-bold"><CalendarIcon className="w-4 h-4"/> Year {classSec.academicYear.name}</span>
          </div>
        </div>
        
        {/* Date Picker using native form GET submission */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm relative z-10">
          <form method="GET" className="flex items-center gap-3">
             <label className="text-sm font-black text-white uppercase tracking-wider">Date:</label>
             <input 
               type="date" 
               name="date" 
               defaultValue={dateStr}
               className="bg-white text-indigo-900 font-bold border-none rounded-xl p-2.5 outline-none shadow-inner cursor-pointer"
               onChange={(e) => {
                 if (e.target.form) e.target.form.submit();
               }}
             />
          </form>
        </div>
      </div>

      <AttendanceGrid 
         classSectionId={classSectionId}
         dateStr={dateStr}
         students={mappedStudents}
         previousRecords={prevRecords}
      />
    </div>
  );
}
