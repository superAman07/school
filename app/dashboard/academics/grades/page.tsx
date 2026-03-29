import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddGradeForm from './AddGradeForm';
import AddSectionForm from './AddSectionForm';
import { deleteGradeLevel, deleteSection } from './actions';

export default async function GradesAndSectionsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const grades = await prisma.gradeLevel.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { sortOrder: 'asc' }
  });

  const sections = await prisma.section.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Grades & Sections</h1>
        <p className="text-gray-500 mt-2 text-lg">Define the class hierarchy and section divisions for your school.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Grade Levels */}
        <div className="space-y-6">
          <AddGradeForm />

          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-lg">Existing Grades ({grades.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {grades.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">No grades created yet.</p>
              ) : (
                <ul className="divide-y">
                  {grades.map((grade, index) => (
                    <li key={grade.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold">
                          {index + 1}
                        </Badge>
                        <span className="font-semibold text-gray-800">{grade.name}</span>
                      </div>
                      <form action={async () => {
                        "use server";
                        await deleteGradeLevel(grade.id);
                      }}>
                        <button type="submit" className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition cursor-pointer">
                          🗑️
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Sections */}
        <div className="space-y-6">
          <AddSectionForm />

          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-lg">Existing Sections ({sections.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sections.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">No sections created yet.</p>
              ) : (
                <ul className="divide-y">
                  {sections.map((section, index) => (
                    <li key={section.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                          {String.fromCharCode(65 + index)}
                        </Badge>
                        <span className="font-semibold text-gray-800">Section {section.name}</span>
                      </div>
                      <form action={async () => {
                        "use server";
                        await deleteSection(section.id);
                      }}>
                        <button type="submit" className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition cursor-pointer">
                          🗑️
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
