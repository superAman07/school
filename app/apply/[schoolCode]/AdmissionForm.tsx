'use client';

import { useActionState } from 'react';
import { submitApplication } from './actions';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdmissionForm({ schoolCode }: { schoolCode: string }) {
  const [state, formAction, isPending] = useActionState(submitApplication, undefined);

  return (
    <form action={formAction}>
      {/* Hidden input securely passes the school code to our server action */}
      <input type="hidden" name="schoolCode" value={schoolCode} />
      
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Parent / Guardian Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Full Name</Label>
              <Input id="parentName" name="parentName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email Address (Used for Login)</Label>
              <Input id="parentEmail" name="parentEmail" type="email" placeholder="john@example.com" required />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Student Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentFirstName">Student First Name</Label>
              <Input id="studentFirstName" name="studentFirstName" placeholder="Jane" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentLastName">Student Last Name</Label>
              <Input id="studentLastName" name="studentLastName" placeholder="Doe" required />
            </div>
          </div>
        </div>

        {state?.error && (
          <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
            {state.error}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-6 rounded-b-xl">
        <Button size="lg" type="submit" className="w-full text-md" disabled={isPending}>
          {isPending ? 'Submitting Application securely...' : 'Submit Application'}
        </Button>
      </CardFooter>
    </form>
  );
}
