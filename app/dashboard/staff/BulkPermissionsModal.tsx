'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveBulkPermissions } from './actions';
import { X, Shield } from 'lucide-react';

export default function BulkPermissionsModal({ staff }: { staff: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state to track checkbox changes before saving
  const [permissions, setPermissions] = useState<Record<string, { isTeacher: boolean, isAdminStaff: boolean, canManageAdmissions: boolean }>>(() => {
    const initial: any = {};
    staff.forEach(s => {
      initial[s.id] = {
        isTeacher: s.isTeacher,
        isAdminStaff: s.isAdminStaff,
        canManageAdmissions: s.canManageAdmissions
      };
    });
    return initial;
  });

  const router = useRouter();

  const handleToggle = (staffId: string, field: 'isTeacher' | 'isAdminStaff' | 'canManageAdmissions') => {
    setPermissions(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: !prev[staffId][field]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveBulkPermissions(permissions);
    setIsSaving(false);
    setIsOpen(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 cursor-pointer shadow-md text-white"
      >
        <Shield className="w-4 h-4" />
        Bulk Update Permissions
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Manage Staff Permissions
            </h2>
            <p className="text-xs text-gray-500 mt-1">Check the boxes below to instantly update what each staff member can do.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white border p-1.5 shadow-sm rounded-md cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Area (Scrollable) */}
        <div className="flex-1 overflow-auto p-0 border-b">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 font-bold text-gray-700 border-r">Staff Member</th>
                <th className="px-6 py-3 font-bold text-center text-blue-800 bg-blue-50 border-r border-b">Is Teacher?</th>
                <th className="px-6 py-3 font-bold text-center text-purple-800 bg-purple-50 border-r border-b">Is Admin Staff?</th>
                <th className="px-6 py-3 font-bold text-center text-amber-800 bg-amber-50 border-b">Manage Admissions?</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 border-r bg-white">
                    <p className="font-bold text-gray-900">{s.user.profile?.firstName} {s.user.profile?.lastName || ''}</p>
                    <p className="text-xs text-gray-400">{s.designation}</p>
                  </td>
                  <td className="px-6 py-3 text-center bg-blue-50/20 border-r">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-600 cursor-pointer shadow-sm rounded" 
                      checked={permissions[s.id].isTeacher}
                      onChange={() => handleToggle(s.id, 'isTeacher')}
                    />
                  </td>
                  <td className="px-6 py-3 text-center bg-purple-50/20 border-r">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-purple-600 cursor-pointer shadow-sm rounded" 
                      checked={permissions[s.id].isAdminStaff}
                      onChange={() => handleToggle(s.id, 'isAdminStaff')}
                    />
                  </td>
                  <td className="px-6 py-3 text-center bg-amber-50/20">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-amber-600 cursor-pointer shadow-sm rounded" 
                      checked={permissions[s.id].canManageAdmissions}
                      onChange={() => handleToggle(s.id, 'canManageAdmissions')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer bg-white">Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-6 shadow-md"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Permissions'}
          </Button>
        </div>

      </div>
    </div>
  );
}
