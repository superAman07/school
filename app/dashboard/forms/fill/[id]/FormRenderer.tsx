'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitForm } from './actions';

export default function FormRenderer({ form }: { form: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};

    form.fields.forEach((field: any) => {
      if (field.inputType === 'CHECKBOX' || field.inputType === 'MULTI_SELECT') {
        data[field.key] = formData.getAll(field.key);
      } else {
        data[field.key] = formData.get(field.key) || '';
      }
    });

    const res = await submitForm(form.id, data);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard?success=form-submitted');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.fields.map((field: any, index: number) => {
        const id = `field_${field.id}`;
        return (
          <div key={field.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
            <label htmlFor={id} className="block font-bold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">{index + 1}.</span>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
            </label>

            <div className="mt-3">
              {field.inputType === 'TEXT' && (
                <input
                  type="text"
                  id={id}
                  name={field.key}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'EMAIL' && (
                <input
                  type="email"
                  id={id}
                  name={field.key}
                  required={field.required}
                  placeholder={field.placeholder || 'example@email.com'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'PHONE' && (
                <input
                  type="tel"
                  id={id}
                  name={field.key}
                  required={field.required}
                  placeholder={field.placeholder || '+1 ...'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'NUMBER' && (
                <input
                  type="number"
                  id={id}
                  name={field.key}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'DATE' && (
                <input
                  type="date"
                  id={id}
                  name={field.key}
                  required={field.required}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'TEXTAREA' && (
                <textarea
                  id={id}
                  name={field.key}
                  required={field.required}
                  rows={4}
                  placeholder={field.placeholder || ''}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
              {field.inputType === 'SELECT' && Array.isArray(field.options) && (
                <select
                  id={id}
                  name={field.key}
                  required={field.required}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="">{field.placeholder || 'Select an option...'}</option>
                  {field.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {field.inputType === 'RADIO' && Array.isArray(field.options) && (
                <div className="space-y-2">
                  {field.options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name={field.key}
                          value={opt}
                          required={field.required}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-indigo-600 transition-all cursor-pointer"
                        />
                        <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {field.inputType === 'CHECKBOX' && Array.isArray(field.options) && (
                <div className="space-y-2">
                  {field.options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name={field.key}
                        value={opt}
                        className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {field.inputType === 'TOGGLE' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.key}
                    value="yes"
                    className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all appearance-none relative"
                  />
                  <span className="text-sm font-medium text-gray-700">Yes</span>
                </label>
              )}
            </div>
          </div>
        );
      })}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
          {!isSubmitting && <span>→</span>}
        </button>
      </div>
    </form>
  );
}
