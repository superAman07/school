'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createForm } from './actions';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateFormModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createForm, undefined);

  if (state?.id) {
    // Redirect to editor after creation
    window.location.href = `/dashboard/forms/${state.id}`;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Create Form
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-extrabold text-gray-900">Create New Form</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Form Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Staff Feedback Survey, Admission 2026"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Form Type</label>
                <select name="context" className="w-full border border-gray-300 rounded-xl p-3 bg-white text-sm">
                  <option value="CUSTOM">📋 General / Custom</option>
                  <option value="ADMISSION">📝 Admission Application</option>
                  <option value="LEAVE">🏖️ Leave Request</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Who fills this form?</label>
                <select name="audience" className="w-full border border-gray-300 rounded-xl p-3 bg-white text-sm">
                  <option value="ALL">👥 Everyone (Staff + Parents)</option>
                  <option value="STAFF">👨‍🏫 Staff Only</option>
                  <option value="PARENTS">👨‍👩‍👧 Parents Only</option>
                  <option value="STUDENTS">🎓 Students</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Description (optional)</label>
                <textarea
                  name="description"
                  placeholder="Brief description of this form..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Closing Date (optional)</label>
                <input
                  name="closingDate"
                  type="date"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {state?.error && <p className="text-red-500 text-sm font-semibold">{state.error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                  {isPending ? 'Creating...' : 'Create & Edit Fields →'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
