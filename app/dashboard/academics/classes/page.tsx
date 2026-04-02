import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateClassForm from './CreateClassForm';
import { deleteClassSection, assignClassTeacher } from './actions';
import { GraduationCap, Trash2, Calendar, MapPin, Users, Settings } from 'lucide-react';

export default async function ClassMatrixPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/dashboard');

  const [classes, years, grades, sections, teachers] = await Promise.all([
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
    prisma.section.findMany({ where: { schoolId: user.schoolId! }, orderBy: { sortOrder: 'asc' } }),
    prisma.user.findMany({
      where: { schoolId: user.schoolId!, role: 'TEACHER' },
      include: { profile: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          Class Matrix Builder
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Combine Academic Year + Grade + Section to generate physical classrooms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT: Class List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0 border-t-4 border-t-indigo-600">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-indigo-900">Active Classrooms</CardTitle>
                <CardDescription className="text-indigo-700 mt-1 font-medium">Currently managing {classes.length} distinct classes.</CardDescription>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-indigo-600 font-black text-xl">{classes.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {classes.length === 0 ? (
                <div className="text-center py-20 px-4 bg-gray-50/50">
                  <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No class sections formulated yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Use the builder on the right to combine a Grade and Section.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {classes.map(cls => (
                    <li key={cls.id} className="p-6 bg-white hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-4 flex-1">
                          
                          {/* Title & Badges */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
                              {cls.gradeLevel.name} — Section {cls.section.name}
                            </span>
                            {cls.academicYear.isCurrent && (
                              <Badge className="bg-green-100 text-green-800 border-none shadow-sm text-xs font-bold px-3 py-1">CURRENT YEAR</Badge>
                            )}
                          </div>
                          
                          {/* Metadata Tags */}
                          <div className="flex items-center gap-5 text-sm font-medium text-gray-600">
                            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-md">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {cls.academicYear.name}
                            </div>
                            {cls.roomName && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {cls.roomName}
                              </div>
                            )}
                            {cls.capacity && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-gray-400" />
                                Max {cls.capacity}
                              </div>
                            )}
                          </div>

                          {/* Class Teacher Assignment */}
                          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                            <div className="flex items-center gap-2 mb-2">
                               <Settings className="w-4 h-4 text-indigo-500" />
                               <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Class Teacher</span>
                            </div>
                            <form action={async (formData: FormData) => {
                              "use server";
                              const teacherId = formData.get('teacherId') as string;
                              await assignClassTeacher(cls.id, teacherId);
                            }} className="flex items-center gap-3">
                              <select
                                key={cls.classTeacherId || 'none'}
                                name="teacherId"
                                defaultValue={cls.classTeacherId || ''}
                                className="text-sm border border-indigo-200 rounded-lg p-2.5 bg-white text-gray-900 font-medium flex-1 shadow-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="">— Unassigned —</option>
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.profile?.firstName} {t.profile?.lastName || ''}
                                  </option>
                                ))}
                              </select>
                              <button type="submit" className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-bold cursor-pointer">
                                Save
                              </button>
                            </form>
                          </div>

                        </div>

                        {/* Delete Action */}
                        <form action={async () => {
                          "use server";
                          await deleteClassSection(cls.id);
                        }}>
                          <button type="submit" className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600 p-3 rounded-xl transition cursor-pointer mt-1" title="Delete Class Section">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Create Form */}
        <div className="lg:col-span-1 sticky top-6">
          <CreateClassForm years={years} grades={grades} sections={sections} />
        </div>
      </div>
    </div>
  );
}