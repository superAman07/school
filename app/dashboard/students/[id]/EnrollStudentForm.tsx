'use client';

import { useActionState } from 'react';
import { enrollStudent } from './actions';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function EnrollStudentForm({
  studentId,
  classSections,
}: {
  studentId: string;
  classSections: { id: string; label: string; academicYearId: string }[];
}) {
  const [state, formAction, isPending] = useActionState(enrollStudent, undefined);

  if (classSections.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No class sections available. Ask admin to create them in Class Matrix first.
      </p>
    );
  }

  return (
    <form action={formAction} className="p-5 space-y-4">
      <input type="hidden" name="studentId" value={studentId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Class Section</label>
          <select
            name="classSectionId"
            required
            className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">— Select Class —</option>
            {classSections.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Roll Number (optional)</label>
          <input
            type="number"
            name="rollNumber"
            min={1}
            placeholder="e.g. 12"
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-red-500 text-sm font-semibold">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-green-600 text-sm font-semibold">{state.success}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl cursor-pointer"
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enrolling...</>
          : <><GraduationCap className="w-4 h-4 mr-2" /> Enroll Student</>
        }
      </Button>
    </form>
  );
}
