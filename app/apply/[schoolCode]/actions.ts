'use server';

import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function submitApplication(prevState: any, formData: FormData) {
  const schoolCode = formData.get('schoolCode') as string;
  
  // 1. We lock in the Parent's fixed credentials for strict security
  const parentName = formData.get('core_parentName') as string;
  const parentEmail = formData.get('core_parentEmail') as string;
  
  // 2. We extract ALL the dynamic fields cleanly!
  // Any input field coming from the frontend that starts with 'dynamic_' gets captured.
  const dynamicData: Record<string, string> = {};
  
  formData.forEach((value, key) => {
    if (key.startsWith('dynamic_')) {
      const cleanKey = key.replace('dynamic_', '');
      dynamicData[cleanKey] = value.toString();
    }
  });

  const school = await prisma.school.findUnique({ where: { code: schoolCode } });
  if (!school) return { error: 'Invalid school link.' };

  const tempPassword = 'Welcome123!'; 
  const passwordHash = await hash(tempPassword, 10);

  try {
    await prisma.$transaction(async (tx) => {
      let parentUser = await tx.user.findUnique({ where: { email: parentEmail } });
      
      if (!parentUser) {
        parentUser = await tx.user.create({
          data: {
            email: parentEmail,
            passwordHash,
            role: Role.PARENT,
            schoolId: school.id,
            profile: {
               create: { firstName: parentName }
            }
          }
        });
      }

      await tx.admissionApplication.create({
        data: {
          schoolId: school.id,
          applicationNo: `APP-${Date.now().toString().slice(-6)}`,
          submittedByUserId: parentUser.id,
          scholarName: 'Extracted from Form Submission', 
          parentOrGuardianName: parentName,
          contactEmail: parentEmail,
          status: 'SUBMITTED',
          
          // 3. Magic! We dump all 15+ Hindi/English dynamic answers into this single JSON blob!
          extraData: dynamicData 
        }
      });
    });
  } catch (error) {
    console.error(error);
    return { error: 'Failed to submit application. Please try again.' };
  }

  // Kick the parent to their portal automatically!
  redirect(`/login?msg=Application+Submitted!+Login+with+${parentEmail}+and+password:+${tempPassword}`);
}
