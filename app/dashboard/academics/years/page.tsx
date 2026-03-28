import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddYearForm from './AddYearForm';
import { deleteAcademicYear } from './actions';

export default async function AcademicYearsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const years = await prisma.academicYear.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Academic Years</h1>
        <p className="text-gray-500 mt-2 text-lg">Define the academic calendar for your institution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Year List */}
        <div className="lg:col-span-2 space-y-4">
          {years.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="p-16 text-center">
                <p className="text-gray-500 text-lg font-medium">No academic years created yet.</p>
                <p className="text-gray-400 text-sm mt-2">Use the form on the right to create your first academic year.</p>
              </CardContent>
            </Card>
          ) : (
            years.map(year => (
              <Card key={year.id} className="shadow-sm border-0 hover:shadow-md transition-shadow group relative">
                <CardHeader className="p-5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{year.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {year.startDate.toLocaleDateString()} — {year.endDate.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {year.isCurrent && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">
                        ACTIVE
                      </Badge>
                    )}
                    <form action={async () => {
                      "use server";
                      await deleteAcademicYear(year.id);
                    }}>
                      <button type="submit" className="opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg text-sm shadow-sm transition cursor-pointer">
                        🗑️ Delete
                      </button>
                    </form>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* RIGHT: Create Form */}
        <div className="lg:col-span-1">
          <AddYearForm />
        </div>
      </div>
    </div>
  );
}
