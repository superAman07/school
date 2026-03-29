'use client';

import { useActionState } from 'react';
import { submitAdmissionByStaff } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

export default function TeacherAdmissionForm({
  dynamicFields,
  templateId
}: {
  dynamicFields: any[];
  templateId: string;
}) {
  const [state, formAction, isPending] = useActionState(submitAdmissionByStaff, undefined);

  if (state?.success) {
    return (
      <div className="max-w-xl mx-auto mt-8 text-center space-y-4 py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
          <ClipboardList className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Application Submitted!</h2>
        <p className="text-gray-500 text-sm">{state.success}</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/dashboard/teacher">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="templateId" value={templateId} />

      {/* Dynamic fields from Form Builder */}
      <Card className="shadow-sm border-0">
        <CardHeader className="bg-gray-50 border-b p-5">
          <CardTitle className="text-base">Student Information</CardTitle>
          <p className="text-xs text-gray-400 mt-1">Fields configured by your school admin</p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dynamicFields.map(field => (
              <div
                key={field.id}
                className={`space-y-2 ${field.inputType === 'TEXTAREA' ? 'md:col-span-2' : ''}`}
              >
                <Label className="font-bold text-sm text-gray-800">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {field.inputType === 'TEXT' && (
                  <Input
                    name={`dynamic_${field.key}`}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                )}
                {field.inputType === 'NUMBER' && (
                  <Input
                    type="number"
                    name={`dynamic_${field.key}`}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                )}
                {field.inputType === 'EMAIL' && (
                  <Input
                    type="email"
                    name={`dynamic_${field.key}`}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                )}
                {field.inputType === 'PHONE' && (
                  <Input
                    type="tel"
                    name={`dynamic_${field.key}`}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                )}
                {field.inputType === 'DATE' && (
                  <Input
                    type="date"
                    name={`dynamic_${field.key}`}
                    required={field.required}
                  />
                )}
                {field.inputType === 'TEXTAREA' && (
                  <textarea
                    name={`dynamic_${field.key}`}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    className="w-full border border-gray-300 rounded-lg p-3 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {field.inputType === 'SELECT' && field.options && (
                  <select
                    name={`dynamic_${field.key}`}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                  >
                    <option value="">— Select —</option>
                    {field.options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.inputType === 'RADIO' && field.options && (
                  <div className="flex gap-4 flex-wrap pt-1">
                    {field.options.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name={`dynamic_${field.key}`} value={opt} required={field.required} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {state?.error && (
        <p className="text-red-500 font-semibold text-sm">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link href="/dashboard/teacher">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 px-8 cursor-pointer"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : 'Submit Application →'}
        </Button>
      </div>
    </form>
  );
}