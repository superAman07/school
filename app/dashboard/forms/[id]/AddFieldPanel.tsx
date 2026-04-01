'use client';

import { useActionState, useState } from 'react';
import { addField } from './actions';
import { Button } from '@/components/ui/button';
import { Plus, AlignLeft, Hash, Calendar, List, CheckSquare, Mail, Phone, ToggleLeft } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Short Text', icon: AlignLeft },
  { value: 'TEXTAREA', label: 'Long Text', icon: AlignLeft },
  { value: 'NUMBER', label: 'Number', icon: Hash },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'PHONE', label: 'Phone', icon: Phone },
  { value: 'DATE', label: 'Date', icon: Calendar },
  { value: 'SELECT', label: 'Dropdown', icon: List },
  { value: 'RADIO', label: 'Radio Choice', icon: List },
  { value: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare },
  { value: 'TOGGLE', label: 'Yes / No Toggle', icon: ToggleLeft },
];

export default function AddFieldPanel({ formId }: { formId: string }) {
  const [state, formAction, isPending] = useActionState(addField, undefined);
  const [inputType, setInputType] = useState('TEXT');
  const showOptions = ['SELECT', 'RADIO', 'CHECKBOX', 'MULTI_SELECT'].includes(inputType);
  const SelectedIcon = FIELD_TYPES.find(t => t.value === inputType)?.icon || AlignLeft;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-5 py-4">
        <h3 className="text-white font-bold text-sm">Add Question</h3>
        <p className="text-indigo-200 text-xs mt-0.5">Fill in and click Add Field</p>
      </div>

      <form action={formAction} className="p-5 space-y-4">
        <input type="hidden" name="formId" value={formId} />

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Question *</label>
          <input
            name="label"
            required
            placeholder="e.g. Student Name / छात्र का नाम"
            className="w-full border border-gray-300 text-gray-900 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Field type - visual selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Field Type</label>
          <select
            name="inputType"
            value={inputType}
            onChange={e => setInputType(e.target.value)}
            className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {FIELD_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {/* Preview chip */}
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
            <SelectedIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-700">
              {FIELD_TYPES.find(t => t.value === inputType)?.label}
            </span>
          </div>
        </div>

        {/* Options (for SELECT/RADIO/CHECKBOX) */}
        {showOptions && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Options <span className="text-red-500">*</span></label>
            <input
              name="options"
              required
              placeholder="Male, Female, Other"
              className="w-full border border-gray-300 text-gray-900 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400">Separate each option with a comma</p>
          </div>
        )}

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Placeholder <span className="text-gray-300">(optional)</span></label>
          <input
            name="placeholder"
            placeholder="e.g. Enter student name..."
            className="w-full border border-gray-300 text-gray-900 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Required toggle */}
        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
          <input type="checkbox" name="required" defaultChecked className="w-4 h-4 rounded accent-indigo-600" />
          <span className="text-sm font-semibold text-gray-700">Required field</span>
        </label>

        {state?.error && <p className="text-red-500 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-sm font-bold bg-green-50 px-3 py-2 rounded-lg">{state.success}</p>}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl cursor-pointer py-3"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isPending ? 'Adding...' : 'Add Field'}
        </Button>
      </form>
    </div>
  );
}