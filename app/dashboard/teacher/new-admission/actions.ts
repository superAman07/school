'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function submitAdmissionByStaff(prevState: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'TEACHER') return { error: 'Unauthorized' };

  const templateId = formData.get('templateId') as string;

  // Collect all dynamic_* fields into extraData
  const extraData: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith('dynamic_')) {
      extraData[key.replace('dynamic_', '')] = value as string;
    }
  });

  // Try to extract common known fields from dynamic data for core DB fields
  const scholarName = extraData['student_name'] || extraData['scholar_name'] || extraData['name'] || 'Walk-in Student';
  const fatherName = extraData['father_name'] || extraData['fatherName'] || null;
  const motherName = extraData['mother_name'] || extraData['motherName'] || null;
  const contactPhone = extraData['phone'] || extraData['contact_phone'] || extraData['mobile'] || null;
  const contactEmail = extraData['email'] || extraData['contact_email'] || null;
  const religion = extraData['religion'] || null;
  const caste = extraData['caste'] || extraData['category'] || null;
  const classSeekingAdmission = extraData['class'] || extraData['class_seeking'] || extraData['grade'] || null;
  const dob = extraData['dob'] || extraData['date_of_birth'] || null;

  if (!templateId) return { error: 'Form template not found. Contact your admin.' };

  try {
    const appNo = `APP-${Date.now()}`;

    await prisma.admissionApplication.create({
      data: {
        schoolId: user.schoolId!,
        applicationNo: appNo,
        status: 'SUBMITTED',
        submittedByUserId: user.id,
        formTemplateId: templateId,
        scholarName,
        fatherName,
        motherName,
        contactPhone,
        contactEmail,
        dateOfBirth: dob ? new Date(dob) : null,
        religion,
        caste,
        classSeekingAdmission,
        extraData,
      }
    });

    revalidatePath('/dashboard/teacher');
    return {
      success: `Application ${appNo} submitted successfully! The admin will review it shortly.`,
      appNo
    };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to submit application. Please try again.' };
  }
}