import React from 'react';

interface SubmitDialogProps {
  isOpen: boolean;
  timeLeft: number; // in seconds
  attemptedCount: number;
  unattemptedCount: number;
  markedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SubmitDialog({
  isOpen,
  timeLeft,
  attemptedCount,
  unattemptedCount,
  markedCount,
  onConfirm,
  onCancel
}: SubmitDialogProps) {
  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#EF4444]/10 text-[#EF4444] rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-[#F8FAFC] text-lg font-bold">Submit Test Session</h3>
        </div>

        {/* Attempt Statistics */}
        <div className="bg-[#0F172A]/50 border border-[#334155]/40 rounded-xl p-4 space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center text-[#CBD5E1]">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#3B82F6]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Time Left
            </span>
            <span className="font-bold text-[#3B82F6]">{formatTime(timeLeft)}</span>
          </div>

          <div className="h-[1px] bg-[#334155]/40" />

          <div className="flex justify-between items-center text-[#CBD5E1]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full" />
              Attempted
            </span>
            <span className="font-bold text-[#F8FAFC]">{attemptedCount}</span>
          </div>

          <div className="flex justify-between items-center text-[#CBD5E1]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#334155] rounded-full" />
              Unattempted
            </span>
            <span className="font-bold text-[#F8FAFC]">{unattemptedCount}</span>
          </div>

          <div className="flex justify-between items-center text-[#CBD5E1]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full" />
              Marked for Review
            </span>
            <span className="font-bold text-[#F59E0B]">{markedCount}</span>
          </div>
        </div>

        <p className="text-sm text-[#CBD5E1] text-center leading-relaxed font-medium">
          Are you sure you want to submit this test?
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-[#334155] hover:bg-[#334155]/80 text-[#CBD5E1] rounded-xl text-sm font-semibold transition-colors cursor-pointer outline-none"
          >
            No, Resume
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer outline-none"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}
