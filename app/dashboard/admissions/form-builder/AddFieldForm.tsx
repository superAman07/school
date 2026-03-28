'use client';
import { useActionState } from 'react';
import { addFormField } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddFieldForm() {
  const [state, formAction, isPending] = useActionState(addFormField, undefined);

  return (
    <Card className="sticky top-6 shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 border-b p-5">
        <CardTitle className="text-white">Create New Input</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-bold">Field Label (Hindi/English)</Label>
            <Input name="label" required placeholder="e.g. छात्र का नाम / Student Name" className="border-gray-300" />
          </div>
          
          <div className="space-y-2">
            <Label className="font-bold">Input Database Type</Label>
            <select name="inputType" className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm">
              <option value="TEXT">Short Text (Names)</option>
              <option value="TEXTAREA">Long Paragraph (Addresses)</option>
              <option value="DATE">Date Picker (DOB)</option>
              <option value="NUMBER">Number (Phone / Age)</option>
            </select>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <input type="checkbox" name="required" defaultChecked className="w-5 h-5 rounded text-blue-600" />
            <span className="text-sm font-semibold">Make this field MANDATORY</span>
          </label>

          {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 text-md py-6 cursor-pointer shadow-md transition-all" disabled={isPending}>
            {isPending ? 'Injecting Field...' : '+ Add Field to Form'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
