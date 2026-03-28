'use client';

import { useActionState } from 'react';
import { createAcademicYear } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddYearForm() {
  const [state, formAction, isPending] = useActionState(createAcademicYear, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>Create Academic Year</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-bold">Year Name</Label>
            <Input name="name" required placeholder="e.g. 2025-2026" className="border-gray-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Start Date</Label>
              <Input name="startDate" type="date" required className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">End Date</Label>
              <Input name="endDate" type="date" required className="border-gray-300" />
            </div>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <input type="checkbox" name="isCurrent" className="w-5 h-5 rounded text-blue-600" />
            <span className="text-sm font-semibold">Set as Current Active Year</span>
          </label>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-md py-6 cursor-pointer shadow-md transition-all" disabled={isPending}>
            {isPending ? 'Creating...' : '+ Add Academic Year'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
