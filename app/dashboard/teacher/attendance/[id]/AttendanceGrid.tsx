'use client';

import { useState, useTransition } from 'react';
import { submitAttendance } from './actions';
import { useRouter } from 'next/navigation';
import { AttendanceStatus } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Save, CopyCheck, AlertCircle } from 'lucide-react';

type StudentEnr = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
  rollNumber: number | null;
  photoUrl: string | null;
};

type PrevRecord = {
  enrollmentId: string;
  status: AttendanceStatus;
  remark: string | null;
};

type Props = {
  classSectionId: string;
  dateStr: string;
  students: StudentEnr[];
  previousRecords: PrevRecord[];
};

export default function AttendanceGrid({ classSectionId, dateStr, students, previousRecords }: Props) {
  // Local state mapped by enrollmentId
  const [data, setData] = useState<Record<string, { status: AttendanceStatus, remark: string }>>(
    previousRecords.reduce((acc, rec) => ({
      ...acc, [rec.enrollmentId]: { status: rec.status, remark: rec.remark || '' }
    }), {})
  );
  
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMark = (enrollmentId: string, status: AttendanceStatus) => {
    setData(prev => ({
      ...prev,
      [enrollmentId]: { status, remark: prev[enrollmentId]?.remark || '' }
    }));
  };

  const handleRemark = (enrollmentId: string, remark: string) => {
    setData(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], remark }
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newData = { ...data };
    students.forEach(s => {
      newData[s.enrollmentId] = { status, remark: newData[s.enrollmentId]?.remark || '' };
    });
    setData(newData);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const recordsToSave = Object.entries(data).map(([enrollmentId, val]) => {
          const studentId = students.find(s => s.enrollmentId === enrollmentId)?.studentId || '';
          return { enrollmentId, studentId, status: val.status, remark: val.remark };
        });
        
        await submitAttendance(classSectionId, dateStr, recordsToSave);
        alert(`Attendance for ${dateStr} has been successfully locked in!`);
        router.refresh();
      } catch(e) {
        alert("Failed to save attendance.");
        console.error(e);
      }
    });
  };

  const markedCount = Object.keys(data).length;
  const isComplete = markedCount === students.length;

  return (
    <Card className="shadow-2xl border-0 overflow-hidden mt-6 rounded-2xl">
      <CardHeader className="bg-white border-b p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Student Register</CardTitle>
          <CardDescription className="text-gray-500 font-medium mt-1">
            {markedCount} out of {students.length} students marked.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleMarkAll('PRESENT')} className="border-green-200 text-green-700 hover:bg-green-50 shadow-sm transition flex-1 sm:flex-none cursor-pointer">
            <CopyCheck className="w-4 h-4 mr-2" /> Mark All Present
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || markedCount === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md transition flex-1 sm:flex-none cursor-pointer"
          >
            {isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Register</>}
          </Button>
        </div>
      </CardHeader>
      
      {!isComplete && students.length > 0 && (
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2 text-amber-800 text-sm font-bold">
          <AlertCircle className="w-4 h-4" /> Please ensure all {students.length} students are marked before saving completely.
        </div>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Roll</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Student</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-center w-64">Attendance Status</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs w-1/3">Reason / Details (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student, idx) => {
                const rowData = data[student.enrollmentId];
                const isActive = !!rowData;
                
                return (
                  <tr key={student.enrollmentId} className={`transition-colors ${isActive ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 font-mono font-bold text-gray-500 text-sm">
                      {student.rollNumber || (idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                          {student.firstName[0]}
                        </div>
                        <span className="font-extrabold text-gray-900 text-base">
                          {student.firstName} {student.lastName || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-full bg-gray-100 p-1 rounded-xl shadow-inner">
                        <button 
                          onClick={() => handleMark(student.enrollmentId, 'PRESENT')}
                          className={`flex-1 flex justify-center py-2 rounded-lg transition-all text-xs font-bold cursor-pointer ${rowData?.status === 'PRESENT' ? 'bg-white text-green-600 shadow-md ring-1 ring-green-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleMark(student.enrollmentId, 'ABSENT')}
                          className={`flex-1 flex justify-center py-2 rounded-lg transition-all text-xs font-bold cursor-pointer ${rowData?.status === 'ABSENT' ? 'bg-white text-red-600 shadow-md ring-1 ring-red-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => handleMark(student.enrollmentId, 'LATE')}
                          className={`flex-1 flex justify-center py-2 rounded-lg transition-all text-xs font-bold cursor-pointer ${rowData?.status === 'LATE' ? 'bg-white text-amber-600 shadow-md ring-1 ring-amber-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Reason input is only strongly prompted if absent or late, but always available */}
                      <Input 
                        placeholder={
                          rowData?.status === 'ABSENT' ? "Provide reason for absence..." : 
                          rowData?.status === 'LATE' ? "Provide reason for tardiness..." : "Add a custom note..."
                        }
                        value={rowData?.remark || ''}
                        onChange={(e) => handleRemark(student.enrollmentId, e.target.value)}
                        disabled={!rowData} // Force them to pick a status first
                        className={`transition-all ${
                          rowData?.status === 'ABSENT' && !rowData?.remark ? 'border-amber-300 bg-amber-50 focus:ring-amber-500' :
                          !rowData ? 'bg-gray-100 opacity-50 cursor-not-allowed' :
                          'bg-white border-gray-200'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
              
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
