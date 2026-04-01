import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FormFieldsList from './FormFieldsList';
import AddFieldPanel from './AddFieldPanel';
import { togglePublish } from '../actions';

export default async function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const { id } = await params;

  const form = await prisma.formTemplate.findUnique({
    where: { id, schoolId: user.schoolId! },
    include: {
      fields: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { submissions: true } }
    }
  });

  if (!form || form.deletedAt) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/forms" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> All Forms
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{form.name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{form.context}</Badge>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{form.audience}</Badge>
              <Badge className={form.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                {form.isPublished ? '✅ Published' : '⏸ Draft'}
              </Badge>
              <span className="text-xs text-gray-400 self-center">{form._count.submissions} responses · {form.fields.length} fields</span>
            </div>
          </div>

          {/* Publish toggle */}
          <form action={async () => {
            'use server';
            await togglePublish(id, form.isPublished);
          }}>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border
                ${form.isPublished
                  ? 'bg-white text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600'
                  : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                }`}
            >
              {form.isPublished ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish Form</>}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fields preview */}
        <div className="lg:col-span-2">
          <FormFieldsList formId={form.id} fields={form.fields as any[]} />
        </div>

        {/* Add field panel */}
        <div>
          <AddFieldPanel formId={form.id} />
        </div>
      </div>
    </div>
  );
}
