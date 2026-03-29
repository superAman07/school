'use client';

import { useActionState } from 'react';
import { createSection } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddSectionForm() {
  const [state, formAction, isPending] = useActionState(createSection, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-indigo-900 text-white p-5">
        <CardTitle>Add Section</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="font-bold">Section Name</Label>
            <Input name="name" required placeholder="e.g. A, B, C" className="border-gray-300" />
          </div>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 cursor-pointer shadow-md transition-all" disabled={isPending}>
            {isPending ? 'Creating...' : '+ Add Section'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
