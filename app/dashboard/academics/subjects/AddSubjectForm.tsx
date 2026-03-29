'use client';

import { useActionState } from 'react';
import { createSubject } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubject, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden sticky top-6">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>Add New Subject</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-bold">Subject Name</Label>
            <Input name="name" required placeholder="e.g. Mathematics, Hindi, Science" className="border-gray-300" />
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Subject Code <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input name="code" placeholder="e.g. MATH, HIN, SCI" className="border-gray-300 uppercase" />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <input type="checkbox" name="isOptional" className="w-5 h-5 rounded text-blue-600" />
            <span className="text-sm font-semibold">This is an Optional subject</span>
          </label>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 cursor-pointer shadow-md transition-all" disabled={isPending}>
            {isPending ? 'Creating...' : '+ Add Subject'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
