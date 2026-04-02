'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createClassSection } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

type Props = {
  years: { id: string; name: string; isCurrent: boolean }[];
  grades: { id: string; name: string }[];
  sections: { id: string; name: string }[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg font-bold shadow-lg transition-all" disabled={pending}>
      {pending ? 'Generating...' : <><PlusCircle className="mr-2 w-5 h-5"/> Create physical classroom</>}
    </Button>
  );
}

export default function CreateClassForm({ years, grades, sections }: Props) {
  const [state, formAction] = useFormState(createClassSection, undefined);

  return (
    <Card className="shadow-2xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 text-white p-6">
        <CardTitle className="text-xl">Form New Class</CardTitle>
        <CardDescription className="text-gray-400 mt-1">Combine grades & sections to open a room.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-6 bg-gray-50/50">

          <div className="space-y-2">
            <Label className="font-bold text-gray-700 uppercase text-xs tracking-wider">Academic Year</Label>
            <select name="academicYearId" required className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 outline-none transition-all">
              <option value="">-- Mandatory: Select Year --</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Active)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700 uppercase text-xs tracking-wider">Grade Level</Label>
            <select name="gradeLevelId" required className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 outline-none transition-all">
              <option value="">-- Mandatory: Select Grade --</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700 uppercase text-xs tracking-wider">Section ID</Label>
            <select name="sectionId" required className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 outline-none transition-all">
              <option value="">-- Mandatory: Select Section --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div className="h-px w-full bg-gray-200 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 uppercase text-xs tracking-wider">Room Designation</Label>
              <Input name="roomName" placeholder="e.g. Science Lab 1" className="border-gray-300 shadow-sm bg-white rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 uppercase text-xs tracking-wider">Max Capacity</Label>
              <Input name="capacity" type="number" placeholder="e.g. 40" className="border-gray-300 shadow-sm bg-white rounded-xl" />
            </div>
          </div>

          {state?.error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200">{state.error}</div>}
          {state?.success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">{state.success}</div>}

          <div className="pt-2">
             <SubmitButton />
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
