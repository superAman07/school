'use client';

import { useState } from 'react';
import { submitAttendance } from './actions';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'PRESENT' | 'ABSENT' | 'LATE';

export default function AttendanceForm({
  classId, attendanceDate, enrollments, existingRecords, sessionId
}: {
  classId: string;
  attendanceDate: string;
  enrollments: any[];
  existingRecords: any[];
  sessionId: string | null;
}) {
  const buildInitial = () => {
    const m: Record<string, Status> = {};
    enrollments.forEach(e => {
      const rec = existingRecords.find(r => r.enrollmentId === e.id);
      m[e.id] = (rec?.status as Status) || 'PRESENT';
    });
    return m;
  };

  const [statuses, setStatuses] = useState<Record<string, Status>>(buildInitial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const toggle = (enrollmentId: string, status: Status) => {
    setStatuses(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const presentCount = Object.values(statuses).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(statuses).filter(s => s === 'ABSENT').length;
  const lateCount = Object.values(statuses).filter(s => s === 'LATE').length;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const result = await submitAttendance({ classId, attendanceDate, statuses, sessionId });
    setLoading(false);
    if (result?.error) setError(result.error);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Attendance Submitted!</h2>
        <p className="text-gray-500 text-sm">{presentCount} Present · {absentCount} Absent · {lateCount} Late</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-2 flex-wrap">
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">{presentCount} Present</span>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">{absentCount} Absent</span>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">{lateCount} Late</span>
        <button
          className="ml-auto text-xs text-indigo-600 font-bold underline"
          onClick={() => {
            const all: Record<string, Status> = {};
            enrollments.forEach(e => { all[e.id] = 'PRESENT'; });
            setStatuses(all);
          }}
        >
          Mark All Present
        </button>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {enrollments.map((enrollment, i) => {
          const status = statuses[enrollment.id];
          return (
            <div key={enrollment.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-xs font-bold text-gray-400 w-7 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {enrollment.student.firstName} {enrollment.student.lastName || ''}
                </p>
                {enrollment.rollNumber && (
                  <p className="text-xs text-gray-400">Roll #{enrollment.rollNumber}</p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => toggle(enrollment.id, 'PRESENT')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'PRESENT' ? 'bg-green-100 text-green-600 ring-2 ring-green-400' : 'text-gray-300 hover:text-green-500'}`}
                  title="Present"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggle(enrollment.id, 'ABSENT')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'ABSENT' ? 'bg-red-100 text-red-600 ring-2 ring-red-400' : 'text-gray-300 hover:text-red-500'}`}
                  title="Absent"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggle(enrollment.id, 'LATE')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'LATE' ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-400' : 'text-gray-300 hover:text-amber-500'}`}
                  title="Late"
                >
                  <Clock className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={loading || enrollments.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-3 rounded-xl cursor-pointer"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : `Submit Attendance (${enrollments.length} students)`}
      </Button>
    </div>
  );
}