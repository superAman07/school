import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FormContext, FormAudience } from '@prisma/client';
import { Plus, FileText, Users, User, GraduationCap, Globe, Lock, Unlock, Clock } from 'lucide-react';
import CreateFormModal from './CreateFormModal';
import { deleteFormTemplate } from './actions';

const audienceIcon = {
  ALL: Globe, STAFF: Users, PARENTS: User, STUDENTS: GraduationCap
};
const audienceColor = {
  ALL: 'bg-blue-100 text-blue-700', STAFF: 'bg-purple-100 text-purple-700',
  PARENTS: 'bg-green-100 text-green-700', STUDENTS: 'bg-orange-100 text-orange-700'
};
const contextColor = {
  ADMISSION: 'bg-rose-100 text-rose-700', LEAVE: 'bg-yellow-100 text-yellow-700', CUSTOM: 'bg-gray-100 text-gray-600'
};

export default async function FormsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const forms = await prisma.formTemplate.findMany({
    where: { schoolId: user.schoolId!, deletedAt: null },
    include: { fields: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">School Forms</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage all forms — admissions, surveys, events, staff feedback.</p>
        </div>
        <CreateFormModal />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: forms.length, color: 'bg-gray-900' },
          { label: 'Published', value: forms.filter(f => f.isPublished).length, color: 'bg-green-600' },
          { label: 'Admission', value: forms.filter(f => f.context === 'ADMISSION').length, color: 'bg-rose-500' },
          { label: 'Drafts', value: forms.filter(f => !f.isPublished).length, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className={`${s.color} text-white rounded-xl px-4 py-3`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-medium text-white/70">{s.label} Forms</p>
          </div>
        ))}
      </div>

      {/* Forms list */}
      {forms.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl text-center py-16">
          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-400">No forms yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "+ Create Form" to build your first form.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => {
            const AIcon = audienceIcon[form.audience as FormAudience] || Globe;
            const isExpired = form.closingDate && new Date(form.closingDate) < new Date();
            return (
              <div key={form.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{form.name}</h3>
                      {form.isPublished ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Unlock className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${contextColor[form.context as FormContext] || 'bg-gray-100 text-gray-600'}`}>
                        {form.context}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${audienceColor[form.audience as FormAudience]}`}>
                        <AIcon className="w-3 h-3" /> {form.audience}
                      </span>
                      <span className="text-xs text-gray-400">{form.fields.length} fields · {form._count.submissions} responses</span>
                      {form.closingDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> Closes {new Date(form.closingDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                    {form.description && <p className="text-xs text-gray-400 mt-1">{form.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/forms/${form.id}`}>
                      <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-all cursor-pointer border border-indigo-100 hover:border-indigo-600">
                        Edit Fields →
                      </button>
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deleteFormTemplate(form.id);
                    }}>
                      <button
                        type="submit"
                        className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer border border-red-100 hover:border-red-500"
                      >
                        🗑️ Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
