'use client';

import { useState, useEffect } from 'react';
import { deleteFormField, reorderFields } from './actions';
import {
  Trash2,
  GripVertical,
  AlignLeft,
  Hash,
  Calendar,
  List,
  CheckSquare,
  ToggleLeft,
  Mail,
  Phone,
} from 'lucide-react';

const typeIcon: Record<string, any> = {
  TEXT: AlignLeft,
  TEXTAREA: AlignLeft,
  NUMBER: Hash,
  EMAIL: Mail,
  PHONE: Phone,
  DATE: Calendar,
  SELECT: List,
  RADIO: List,
  MULTI_SELECT: List,
  CHECKBOX: CheckSquare,
  TOGGLE: ToggleLeft,
};

const typeLabel: Record<string, string> = {
  TEXT: 'Short Text',
  TEXTAREA: 'Long Text',
  NUMBER: 'Number',
  EMAIL: 'Email',
  PHONE: 'Phone',
  DATE: 'Date',
  SELECT: 'Dropdown',
  RADIO: 'Radio',
  CHECKBOX: 'Checkbox',
  MULTI_SELECT: 'Multi-Select',
  TOGGLE: 'Toggle',
};

export default function FormFieldsList({
  formId,
  fields: initialFields,
}: {
  formId: string;
  fields: any[];
}) {
  const [fields, setFields] = useState(initialFields);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const handleDragStart = (id: string) => setDragId(id);

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const fromIdx = fields.findIndex((f) => f.id === dragId);
    const toIdx = fields.findIndex((f) => f.id === targetId);

    const updated = [...fields];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    setFields(updated);
    setDragId(null);
    setDragOverId(null);

    await reorderFields(
      formId,
      updated.map((f) => f.id)
    );
  };

  const handleDelete = async (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    await deleteFormField(fieldId, formId);
  };

  if (fields.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-2xl text-center py-16 bg-gray-50">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-500 font-bold">No fields yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add your first question using the panel →
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field, i) => {
        const Icon = typeIcon[field.inputType] || AlignLeft;
        const isDragging = dragId === field.id;
        const isDragOver =
          dragOverId === field.id && dragId !== field.id;

        return (
          <div
            key={field.id}
            draggable={!editingId}
            onDragStart={() => handleDragStart(field.id)}
            onDragOver={(e) => handleDragOver(e, field.id)}
            onDrop={() => handleDrop(field.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            className={`bg-white border rounded-xl px-4 py-3.5 group transition-all shadow-sm cursor-pointer
              ${isDragging ? 'opacity-40 scale-95 border-indigo-300' : ''}
              ${isDragOver ? 'border-indigo-400 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-200'}
            `}
            onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
          >
            {/* Top row — always visible */}
            <div className="flex items-center gap-3">
              {/* Drag handle + number */}
              <div className="flex items-center gap-2 shrink-0 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
                <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                <span className="text-xs font-black text-gray-400 w-5 text-center">
                  {i + 1}
                </span>
              </div>

              {/* Field info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <p className={`font-bold text-sm text-gray-900 ${expandedId === field.id ? '' : 'truncate'}`}>
                    {field.label}
                  </p>
                  {field.required && (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md shrink-0">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 font-medium">
                    {typeLabel[field.inputType] || field.inputType}
                  </span>
                  {field.options && Array.isArray(field.options) && field.options.length > 0 && (
                    <span className="text-xs text-gray-300">
                      · {(field.options as string[]).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(field.id); }}
                className="text-gray-200 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer p-1.5 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
                title="Delete field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded view — full label + edit */}
            {expandedId === field.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2" onClick={e => e.stopPropagation()}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Full Label:</p>
                {editingId === field.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        const { updateFieldLabel } = await import('./actions');
                        await updateFieldLabel(field.id, editLabel, formId);
                        setEditingId(null);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="border border-gray-300 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800 break-words">{field.label}</p>
                    <button
                      onClick={() => { setEditingId(field.id); setEditLabel(field.label); }}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}