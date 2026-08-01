import React from 'react';

interface TimerProps {
  timeLeft: number; // in seconds
}

export default function Timer({ timeLeft }: TimerProps) {
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const isLowTime = timeLeft < 300; // < 5 minutes

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wide transition-colors ${
      isLowTime 
        ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] animate-pulse' 
        : 'bg-[#1E293B] border-[#334155]/60 text-[#F8FAFC]'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
