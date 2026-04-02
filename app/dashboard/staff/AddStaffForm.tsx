'use client';

import { useActionState } from 'react';
import { createStaffMember } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddStaffForm() {
  const [state, formAction, isPending] = useActionState(createStaffMember, undefined);

  return (
    <Card className="shadow-xl border-0 overflow-hidden sticky top-6">
      <CardHeader className="bg-gray-900 text-white p-5">
        <CardTitle>Add Staff Member</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">First Name</Label>
              <Input name="firstName" required placeholder="Rajesh" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Last Name</Label>
              <Input name="lastName" placeholder="Kumar" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Email (Login ID)</Label>
            <Input name="email" type="email" required placeholder="rajesh@school.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Employee Code</Label>
              <Input name="employeeCode" required placeholder="EMP-001" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Phone</Label>
              <Input name="phone" placeholder="9876543210" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Designation</Label>
            <select name="designation" required className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm">
              <option value="">-- Select Role --</option>
              <option value="Class Teacher">Class Teacher</option>
              <option value="Subject Teacher">Subject Teacher</option>
              <option value="Vice Principal">Vice Principal</option>
              <option value="Librarian">Librarian</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Accountant">Accountant</option>
              <option value="Clerk">Clerk</option>
            </select>
          </div>

          {/* Add this new Permissions section */}
          <div className="space-y-3 pt-2">
            <Label className="font-bold text-gray-500 uppercase text-xs tracking-wider">Permissions & Roles</Label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" name="isTeacher" defaultChecked className="w-4 h-4 accent-blue-600" />
              <div>
                <p className="text-sm font-bold">Is a Teacher</p>
                <p className="text-xs text-gray-500">Will have access to "My Classes" and attendance.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" name="isAdminStaff" className="w-4 h-4 accent-blue-600" />
              <div>
                <p className="text-sm font-bold">Is Admin Staff</p>
                <p className="text-xs text-gray-500">Non-teaching staff role.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-amber-200 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
              <input type="checkbox" name="canManageAdmissions" className="w-4 h-4 accent-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-900">Can Manage Admissions</p>
                <p className="text-xs text-amber-700">Grants power to view and fill admission forms.</p>
              </div>
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-medium">
            ⚠️ Temporary password: <span className="font-mono font-bold">Teacher@123!</span> — Share this with the staff member to login.
          </div>

          {state?.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm font-bold">{state.success}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 cursor-pointer" disabled={isPending}>
            {isPending ? 'Creating Account...' : '+ Add Staff Member'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
