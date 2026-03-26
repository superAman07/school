'use client';

import { useActionState, useState } from 'react';
import { authenticate } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  // State to track whether the password should be visible
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to your school management account
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="teacher@school.com"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
               </div>
               {/* The Relative wrapper allows us to absolutely position the eye icon inside the input */}
               <div className="relative">
                <Input
                  id="password"
                  // Dynamically changes from dots to text
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pr-10" // Padding right so text doesn't overlap the icon
                />
                <button
                  type="button" // Important: prevents the button from submitting the form!
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
                type="submit" 
                className="w-full group" 
                disabled={isPending}
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
            
            {errorMessage && (
              <div className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded-md w-full border border-red-100">
                {errorMessage}
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}