'use client';

import { useActionState } from 'react';
import { toggleAdmissionStatus } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsForm({ initialStatus }: { initialStatus: boolean }) {
  const [state, formAction, isPending] = useActionState(toggleAdmissionStatus, undefined);

  return (
    <Card className="shadow-sm border-gray-200">
      <form action={formAction}>
        <CardHeader className="bg-gray-50 border-b p-6">
          <CardTitle>Admission Intake</CardTitle>
          <CardDescription>Control whether parents can currently submit new enrollment applications via your public portal.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <label className="flex items-center space-x-4 cursor-pointer p-4 border rounded-xl hover:bg-gray-50 transition">
             <input 
              type="checkbox" 
              name="admissionOpen" 
              defaultChecked={initialStatus}
              className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-semibold text-gray-900 text-lg">Accepting New Applications</p>
              <p className="text-sm text-gray-500">If checked, the public /apply link will be active.</p>
            </div>
          </label>

          {state?.success && (
            <div className="mt-4 text-sm font-medium text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
              ✅ {state.success}
            </div>
          )}
          {state?.error && (
            <div className="mt-4 text-sm font-medium text-red-600 bg-red-50 p-4 rounded-lg">
              {state.error}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 border-t bg-gray-50">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
            {isPending ? 'Saving Configuration...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
