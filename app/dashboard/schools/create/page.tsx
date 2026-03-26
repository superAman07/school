'use client';

import { useActionState } from 'react';
import { onboardSchool } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateSchoolPage() {
  const [state, formAction, isPending] = useActionState(onboardSchool, undefined);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Mobile-friendly header layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Onboard School</h1>
          <p className="text-gray-500 mt-1">Deploy a new tenant environment and provision the Principal account.</p>
        </div>
        <Link href="/dashboard/schools">
          <Button variant="outline" className="w-full md:w-auto">Cancel</Button>
        </Link>
      </div>

      <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
        <form action={formAction}>
          <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b p-6">
            <CardTitle>School Information</CardTitle>
            <CardDescription>This creates the isolated database compartment.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* The Grid automatically stacks on phones, but uses 2 columns on tablets/desktops */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">School Code (Unique)</Label>
                <Input id="code" name="code" placeholder="e.g. DPS-002" required className="uppercase" />
                <p className="text-xs text-gray-400">Used for public links (e.g. /apply/DPS-002)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City / Location</Label>
                <Input id="city" name="city" placeholder="Mumbai" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Official School Name</Label>
                <Input id="name" name="name" placeholder="Delhi Public School, Mumbai Branch" required />
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <h3 className="font-semibold text-lg">Principal Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="principalEmail">Principal System Email</Label>
                <Input id="principalEmail" name="principalEmail" type="email" placeholder="principal@dpsmumbai.com" required />
                <p className="text-xs text-gray-400">They will log in with this email and password: SchoolAdmin123!</p>
              </div>
            </div>

            {state?.error && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                {state.error}
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t p-6">
            <Button size="lg" type="submit" className="w-full md:w-auto text-md bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? 'Deploying Tenant...' : 'Deploy New School'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
