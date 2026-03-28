'use client';

import { useActionState } from 'react';
import { submitApplication } from './actions';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdmissionForm({ 
  schoolCode, 
  dynamicFields 
}: { 
  schoolCode: string;
  dynamicFields: any[];
}) {
  const [state, formAction, isPending] = useActionState(submitApplication, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="schoolCode" value={schoolCode} />
      
      <CardContent className="space-y-8 p-8">

        {/* --- FIXED ACCOUNT CREATION SECTION --- */}
        <div className="space-y-4 p-6 bg-blue-50 focus-within:ring-2 focus-within:ring-blue-200 transition-all rounded-xl border border-blue-100">
          <h3 className="font-bold text-xl text-blue-900 border-b border-blue-200 pb-2">Parent / Guardian Account Setup</h3>
          <p className="text-sm text-blue-800">We will instantly provision your secure tracking portal login using this email.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label className="font-bold text-gray-800">Full Name <span className="text-red-500">*</span></Label>
              <Input name="core_parentName" placeholder="Will Smith" required className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-800">Email Address <span className="text-red-500">*</span></Label>
              <Input name="core_parentEmail" type="email" placeholder="will@example.com" required className="bg-white" />
            </div>
          </div>
        </div>

        {/* --- DYNAMIC PRINCIPAL FIELDS SECTION --- */}
        <div className="space-y-6 pt-4">
          <h3 className="font-bold text-xl text-gray-900 border-b pb-2">Student Information</h3>
          
          {dynamicFields.length === 0 ? (
             <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 italic font-medium">This school has not strictly configured its dynamic application requirements yet.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dynamicFields.map(field => (
                <div key={field.id} className={`space-y-2 ${field.inputType === 'TEXTAREA' ? 'md:col-span-2' : ''}`}>
                  <Label className="font-bold text-base text-gray-800 tracking-tight">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.inputType === 'TEXT' && (
                     <Input name={`dynamic_${field.key}`} required={field.required} />
                  )}
                  
                  {field.inputType === 'NUMBER' && (
                     <Input type="number" name={`dynamic_${field.key}`} required={field.required} />
                  )}
                  
                  {field.inputType === 'TEXTAREA' && (
                     <textarea 
                       name={`dynamic_${field.key}`} 
                       required={field.required}
                       className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow block text-sm"
                     />
                  )}

                  {field.inputType === 'DATE' && (
                     <Input type="date" name={`dynamic_${field.key}`} required={field.required} className="bg-white block" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {state?.error && (
          <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
            {state.error}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-8 rounded-b-2xl">
        <Button size="lg" type="submit" className="w-full text-lg shadow-xl font-bold py-6 bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 transition-all" disabled={isPending || dynamicFields.length === 0}>
           {isPending ? 'Encrypting & Submitting Credentials...' : 'Sign Data & Submit Application'}
        </Button>
      </CardFooter>
    </form>
  );
}