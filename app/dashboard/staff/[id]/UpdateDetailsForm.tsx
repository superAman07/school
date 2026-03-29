'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpdateDetailsForm({ staffProfile, action }: { staffProfile: any; action: any }) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>✏️ Update Details</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-4">
          <input type="hidden" name="staffUserId" value={staffProfile.userId} />
          <input type="hidden" name="staffProfileId" value={staffProfile.id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">First Name</Label>
              <Input name="firstName" defaultValue={staffProfile.user.profile?.firstName || ''} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Last Name</Label>
              <Input name="lastName" defaultValue={staffProfile.user.profile?.lastName || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Phone</Label>
            <Input name="phone" defaultValue={staffProfile.user.profile?.phone || ''} placeholder="9876543210" />
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Designation</Label>
            <select name="designation" defaultValue={staffProfile.designation} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white">
              <option value="Class Teacher">Class Teacher</option>
              <option value="Subject Teacher">Subject Teacher</option>
              <option value="Vice Principal">Vice Principal</option>
              <option value="Librarian">Librarian</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Accountant">Accountant</option>
              <option value="Clerk">Clerk</option>
            </select>
          </div>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 cursor-pointer" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
