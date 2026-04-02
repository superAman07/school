'use client';

import { useState, useTransition } from 'react';
import { processLeave } from './actions';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function LeaveActionBox({ leaveId }: { leaveId: string }) {
  const [note, setNote] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !note) {
      alert("Please provide a reason for rejecting the leave.");
      return;
    }
    startTransition(async () => {
      try {
        await processLeave(leaveId, status, note);
      } catch (e: any) {
        alert(e.message || "Something went wrong.");
      }
    });
  };

  if (isPending) return <div className="text-sm font-bold text-indigo-600 animate-pulse">Processing...</div>;

  return (
    <div className="flex flex-col gap-2 w-full mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
       <Input 
         placeholder="Optional Note / Reason..." 
         value={note} 
         onChange={e => setNote(e.target.value)}
         className="text-sm bg-white border-gray-200"
       />
       <div className="flex gap-2">
         <button 
           onClick={() => handleAction('APPROVED')}
           className="flex-1 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-2 rounded-lg transition"
         >
           <CheckCircle2 className="w-4 h-4" /> Approve
         </button>
         <button 
           onClick={() => handleAction('REJECTED')}
           className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold py-2 rounded-lg transition"
         >
           <XCircle className="w-4 h-4" /> Reject
         </button>
       </div>
    </div>
  );
}
