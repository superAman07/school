'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function toggleAdmissionStatus(prevState: any, formData: FormData) {
  const session = await auth();
  
  // Security Check: Ensure ONLY a logged-in Tenant Admin can change their own school's settings!
  if (!session?.user?.schoolId || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized Access' };
  }

  // The checkbox sends 'on' if it's checked
  const isOpen = formData.get('admissionOpen') === 'on';

  try {
    await prisma.schoolSetting.upsert({
      where: { schoolId: session.user.schoolId },
      // If the settings don't exist yet, create them:
      create: { schoolId: session.user.schoolId, admissionOpen: isOpen },
      // If they do exist, update them:
      update: { admissionOpen: isOpen },
    });
    
    // Tell Next.js to refresh the page so the UI instantly updates
    revalidatePath('/dashboard/settings');
    return { success: `Admissions are now ${isOpen ? 'OPEN' : 'CLOSED'}!` };
  } catch (error) {
    return { error: 'Failed to update settings. Please try again.' };
  }
}