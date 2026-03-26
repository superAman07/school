'use server';

import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function onboardSchool(prevState: any, formData: FormData) {
  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const principalEmail = formData.get('principalEmail') as string;

  if (!code || !name || !principalEmail) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    // Database Transaction: If the user creation fails, the school creation gets rolled back instantly.
    await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          code: code.toUpperCase(),
          name,
          city,
          settings: {
            create: { admissionOpen: false } // Schools default to closed admissions
          }
        }
      });

      // We auto-generate the Principal so you can email them their keys to the castle!
      const defaultPassword = 'SchoolAdmin123!';
      const passwordHash = await hash(defaultPassword, 10);
      
      await tx.user.create({
        data: {
          email: principalEmail,
          passwordHash,
          role: Role.ADMIN,
          schoolId: school.id
        }
      });
    });
  } catch (error) {
     console.error(error);
     return { error: 'Failed to create school. The Code or Principal Email might already be taken.' };
  }

  // Kick the Super Admin back to the tenant list
  redirect('/dashboard/schools');
}
