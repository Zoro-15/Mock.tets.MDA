import React from 'react';

interface SubmitDialogProps {
  isOpen: boolean;
  timeLeft: number; // in seconds
  attemptedCount: number;
  unattemptedCount: number;
  markedCount: number;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SubmitDialog({
  isOpen,
  timeLeft,
  attemptedCount,
  unattemptedCount,
  markedCount,
  isSubmitting = false,
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
        onClick={isSubmitting ? undefined : onCancel}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-md bg-surface-custom border border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-danger-custom/10 text-danger-custom rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-text-primary-custom text-lg font-bold">Submit Test Session</h3>
        </div>

        {/* Attempt Statistics */}
        <div className="bg-background-custom/50 border border-[#334155]/40 rounded-xl p-4 space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center text-text-secondary-custom">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-custom">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Time Left
            </span>
            <span className="font-bold text-primary-custom">{formatTime(timeLeft)}</span>
          </div>

          <div className="h-[1px] bg-[#334155]/40" />

          <div className="flex justify-between items-center text-text-secondary-custom">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary-custom rounded-full" />
              Attempted
            </span>
            <span className="font-bold text-text-primary-custom">{attemptedCount}</span>
          </div>

          <div className="flex justify-between items-center text-text-secondary-custom">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#334155] rounded-full" />
              Unattempted
            </span>
            <span className="font-bold text-text-primary-custom">{unattemptedCount}</span>
          </div>

          <div className="flex justify-between items-center text-text-secondary-custom">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-warning-custom rounded-full" />
              Marked for Review
            </span>
            <span className="font-bold text-warning-custom">{markedCount}</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary-custom text-center leading-relaxed font-medium">
          Are you sure you want to submit this test?
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#334155] hover:bg-[#334155]/80 disabled:opacity-50 text-text-secondary-custom rounded-xl text-sm font-semibold transition-colors cursor-pointer outline-none"
          >
            No, Resume
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary-custom hover:bg-primary-custom/90 disabled:opacity-80 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer outline-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Yes, Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
