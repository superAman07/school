import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddSubjectForm from './AddSubjectForm';
import { deleteSubject } from './actions';

export default async function SubjectsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const subjects = await prisma.subject.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Subjects</h1>
        <p className="text-gray-500 mt-2 text-lg">Define all subjects taught across grade levels in your school.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Subject List */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Subjects ({subjects.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subjects.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <p className="text-gray-500 font-medium">No subjects added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Use the form on the right to add subjects.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {subjects.map(subject => (
                    <li key={subject.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-900">{subject.name}</span>
                        {subject.code && (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {subject.code}
                          </Badge>
                        )}
                        {subject.isOptional && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <form action={async () => {
                        "use server";
                        await deleteSubject(subject.id);
                      }}>
                        <button type="submit" className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition cursor-pointer">
                          🗑️ Delete
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Add Form */}
        <div className="lg:col-span-1">
          <AddSubjectForm />
        </div>
      </div>
    </div>
  );
}
