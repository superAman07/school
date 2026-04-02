'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { approveAndEnroll } from './actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function SubmitButton({ isSuccess }: { isSuccess: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending || isSuccess}
      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all mt-4"
    >
      {pending ? 'Enrolling...' : (isSuccess ? '✅ Enrolled Successfully' : '✅ Approve & Enroll')}
    </button>
  );
}

export default function EnrollmentWizardForm({ submissionId, guesses }: { submissionId: string, guesses: any }) {
  // Using useFormState for Next.js 14 / React 18 compatibility
  const [state, formAction] = useFormState(approveAndEnroll, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-bold border border-green-200">
          {state.success}
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-gray-700 font-bold text-xs uppercase tracking-widest">Official First Name</Label>
        <Input name="firstName" defaultValue={guesses.firstName} required className="bg-white border-gray-300 shadow-sm" />
      </div>
      
      <div className="space-y-1">
        <Label className="text-gray-700 font-bold text-xs uppercase tracking-widest">Official Last Name</Label>
        <Input name="lastName" defaultValue={guesses.lastName} className="bg-white border-gray-300 shadow-sm" />
      </div>

      <div className="h-px bg-gray-200 my-4" />

      <div className="space-y-1 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
        <Label className="text-indigo-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
           Parent Link Email
        </Label>
        <p className="text-xs text-indigo-700 mb-2 mt-1">If provided, we will auto-generate a Guardian Portal account using this email.</p>
        <Input name="parentEmail" defaultValue={guesses.email} placeholder="parent@email.com" type="email" className="bg-white shadow-sm" />
      </div>

      <SubmitButton isSuccess={!!state?.success} />
    </form>
  );
}