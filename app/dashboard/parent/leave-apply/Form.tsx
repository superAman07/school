'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createLeaveRequest } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-6 cursor-pointer">
      {pending ? 'Submitting Application...' : 'Send Leave Request To Teacher'}
    </Button>
  );
}

export default function ParentLeaveForm({ students }: { students: {id: string, name: string}[] }) {
  const [state, formAction] = useFormState(createLeaveRequest, undefined);

  return (
    <Card className="shadow-2xl border-0 overflow-hidden rounded-2xl">
      <div className="h-3 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
      <CardContent className="p-8">
        <form action={formAction} className="space-y-6">
          
          <div className="space-y-3">
            <Label className="font-bold text-gray-900">Select Child</Label>
            <select name="studentId" required className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 outline-none">
              <option value="">-- Choose your child --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-gray-900">Type of Leave</Label>
            <select name="leaveType" required className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 outline-none">
              <option value="MEDICAL">Medical Emergency / Sick Leave</option>
              <option value="CASUAL">Personal / Casual Request</option>
              <option value="VACATION">Family Vacation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="font-bold text-gray-900">From Date</Label>
              <Input type="date" name="fromDate" required className="p-3 bg-gray-50 border-gray-300" />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-gray-900">To Date</Label>
              <Input type="date" name="toDate" required className="p-3 bg-gray-50 border-gray-300" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-gray-900">Reason Details</Label>
            <Textarea name="reason" placeholder="Please provide specific details for the Class Teacher..." rows={4} required className="bg-gray-50 border-gray-300 rounded-xl" />
          </div>

          {state?.error && <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{state.error}</div>}

          <div className="pt-4">
             <SubmitBtn />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
