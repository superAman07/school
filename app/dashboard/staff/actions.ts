'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';

export async function createStaffMember(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const designation = formData.get('designation') as string;
  const employeeCode = formData.get('employeeCode') as string;
  const phone = formData.get('phone') as string;

  if (!firstName || !email || !designation || !employeeCode) {
    return { error: 'First name, email, designation and employee code are required.' };
  }

  const tempPassword = 'Teacher@123!';

  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: await hash(tempPassword, 10),
          role: Role.TEACHER,
          schoolId: user.schoolId!,
          profile: {
            create: { firstName, lastName: lastName || null, phone: phone || null }
          }
        }
      });

      await tx.staffProfile.create({
        data: {
          schoolId: user.schoolId!,
          userId: newUser.id,
          employeeCode,
          designation
        }
      });
    });

    revalidatePath('/dashboard/staff');
    return { success: `Staff member "${firstName}" created! Temp password: Teacher@123!` };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'Email or employee code already exists.' };
    console.error(error);
    return { error: 'Failed to create staff member.' };
  }
}
