import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateClassForm from './CreateClassForm';
import { deleteClassSection } from './actions';

export default async function ClassMatrixPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const [classes, years, grades, sections] = await Promise.all([
    prisma.classSection.findMany({
      where: { schoolId: user.schoolId! },
      include: {
        academicYear: true,
        gradeLevel: true,
        section: true,
        classTeacher: { include: { profile: true } }
      },
      orderBy: [{ academicYear: { startDate: 'desc' } }, { gradeLevel: { sortOrder: 'asc' } }]
    }),
    prisma.academicYear.findMany({ where: { schoolId: user.schoolId! }, orderBy: { startDate: 'desc' } }),
    prisma.gradeLevel.findMany({ where: { schoolId: user.schoolId! }, orderBy: { sortOrder: 'asc' } }),
    prisma.section.findMany({ where: { schoolId: user.schoolId! }, orderBy: { sortOrder: 'asc' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Class Matrix</h1>
        <p className="text-gray-500 mt-2 text-lg">Combine Academic Year + Grade + Section to create physical classrooms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Class List */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gray-50 border-b p-5">
              <CardTitle className="text-lg">All Classes ({classes.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {classes.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <p className="text-gray-500 font-medium">No classes created yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Use the form to combine a Year + Grade + Section.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {classes.map(cls => (
                    <li key={cls.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">{cls.gradeLevel.name} — Section {cls.section.name}</span>
                          {cls.academicYear.isCurrent && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">CURRENT YEAR</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {cls.academicYear.name}</span>
                          {cls.roomName && <span>🏫 {cls.roomName}</span>}
                          {cls.capacity && <span>👥 Capacity: {cls.capacity}</span>}
                          {cls.classTeacher?.profile && (
                            <span>👨‍🏫 {cls.classTeacher.profile.firstName} {cls.classTeacher.profile.lastName || ''}</span>
                          )}
                        </div>
                      </div>
                      <form action={async () => {
                        "use server";
                        await deleteClassSection(cls.id);
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

        {/* RIGHT: Create Form */}
        <div className="lg:col-span-1">
          <CreateClassForm years={years} grades={grades} sections={sections} />
        </div>
      </div>
    </div>
  );
}
