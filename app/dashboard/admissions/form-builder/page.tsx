import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormContext } from '@prisma/client';
import AddFieldForm from './AddFieldForm';
import { deleteFormField } from './actions';

export default async function FormBuilderPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard');

  const template = await prisma.formTemplate.findFirst({
    where: { schoolId: session.user.schoolId!, context: FormContext.ADMISSION },
    include: { fields: { orderBy: { sortOrder: 'asc' } } }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admission Form Builder</h1>
            <p className="text-gray-500 text-sm mt-0.5">Design the online application form parents fill at your public <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-700 font-mono text-xs">/apply</code> link.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-blue-900 text-white rounded-t-xl p-8">
              <CardTitle className="text-2xl">Live Form Canvas Preview</CardTitle>
              <CardDescription className="text-blue-100 text-md">Everything here updates in real-time exactly how parents see it.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-gray-50">
              
              {!template?.fields.length ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl bg-white shadow-sm font-medium">
                  Your admission form is completely blank. <br/> Use the tool on the right to start injecting fields!
                </div>
              ) : (
                template.fields.map(field => (
                  <div key={field.id} className="space-y-2 p-5 border border-gray-200 shadow-sm rounded-xl bg-white relative group transition-all hover:border-blue-300">
                    <form action={async () => {
                      "use server";
                      await deleteFormField(field.id);
                    }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="submit" className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 cursor-pointer rounded-lg text-sm shadow-sm transition">
                        🗑️ Delete
                      </button>
                    </form>
                    <Label className="text-lg font-bold text-gray-800">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {field.inputType === 'TEXT' && <Input className="bg-gray-50 text-gray-400" placeholder="Text answer will go here..." disabled />}
                    {field.inputType === 'NUMBER' && <Input className="bg-gray-50 text-gray-400" placeholder="12345" type="number" disabled />}
                    {field.inputType === 'TEXTAREA' && <textarea className="w-full border rounded-md p-3 h-24 bg-gray-50 text-gray-400" disabled placeholder="Long paragraph answer..." />}
                    {field.inputType === 'DATE' && <Input className="bg-gray-50 text-gray-400 w-1/3" type="date" disabled />}
                  </div>
                ))
              )}

            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <AddFieldForm />
        </div>
      </div>
    </div>
  );
}
