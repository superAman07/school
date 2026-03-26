'use server';

import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function submitApplication(prevState: any, formData: FormData) {
  const schoolCode = formData.get('schoolCode') as string;
  const parentName = formData.get('parentName') as string;
  const parentEmail = formData.get('parentEmail') as string;
  const studentFirstName = formData.get('studentFirstName') as string;
  const studentLastName = formData.get('studentLastName') as string;
  
  const school = await prisma.school.findUnique({ where: { code: schoolCode } });
  if (!school) return { error: 'Invalid school link.' };

  // Temporary password (in a real app, you would email them a magic link or let them set it)
  const tempPassword = 'Welcome123!'; 
  const passwordHash = await hash(tempPassword, 10);

  try {
    // Transaction ensures both the User and the Application are created together safely
    await prisma.$transaction(async (tx) => {
      let parentUser = await tx.user.findUnique({ where: { email: parentEmail } });
      
      if (!parentUser) {
        parentUser = await tx.user.create({
          data: {
            email: parentEmail,
            passwordHash,
            role: Role.PARENT,
            schoolId: school.id,
          }
        });
      }

      await tx.admissionApplication.create({
        data: {
          schoolId: school.id,
          applicationNo: `APP-${Date.now().toString().slice(-6)}`,
          submittedByUserId: parentUser.id,
          scholarName: `${studentFirstName} ${studentLastName}`,
          parentOrGuardianName: parentName,
          contactEmail: parentEmail,
          status: 'SUBMITTED',
        }
      });
    });
  } catch (error) {
    console.error(error);
    return { error: 'Failed to submit application. Please try again.' };
  }

  // Successfully submitted! Redirect the parent to the login screen with instructions.
  redirect(`/login?msg=Application+Submitted!+Login+with+${parentEmail}+and+password:+${tempPassword}`);
}
