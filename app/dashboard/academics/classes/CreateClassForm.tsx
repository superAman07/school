'use client';

import { useActionState } from 'react';
import { createClassSection } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  years: { id: string; name: string; isCurrent: boolean }[];
  grades: { id: string; name: string }[];
  sections: { id: string; name: string }[];
};

export default function CreateClassForm({ years, grades, sections }: Props) {
  const [state, formAction, isPending] = useActionState(createClassSection, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-5">

          <div className="space-y-2">
            <Label className="font-bold">Academic Year</Label>
            <select name="academicYearId" required className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm">
              <option value="">-- Select Year --</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Current)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Grade Level</Label>
            <select name="gradeLevelId" required className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm">
              <option value="">-- Select Grade --</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Section</Label>
            <select name="sectionId" required className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm">
              <option value="">-- Select Section --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Room Name <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input name="roomName" placeholder="e.g. Room 101" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Capacity <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input name="capacity" type="number" placeholder="e.g. 40" className="border-gray-300" />
            </div>
          </div>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 cursor-pointer shadow-md transition-all" disabled={isPending}>
            {isPending ? 'Creating Class...' : '+ Create Class'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
