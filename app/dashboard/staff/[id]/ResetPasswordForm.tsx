'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordForm({ staffUserId, action }: { staffUserId: string; action: any }) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [show, setShow] = useState(true);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>🔑 Reset Password</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-4">
          <input type="hidden" name="staffUserId" value={staffUserId} />

          <div className="space-y-2">
            <Label className="font-bold">New Password</Label>
            <div className="relative">
              <input
                name="newPassword"
                type={show ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter new password..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-16 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
              >
                {show ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <p className="text-xs text-gray-400">Admin can see this. Share the new password with the staff member directly.</p>
          </div>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-bold">✅ {state.success}</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-5 cursor-pointer" disabled={isPending}>
            {isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}