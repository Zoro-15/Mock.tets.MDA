import React from 'react';
import LatexRenderer from './LatexRenderer';

interface OptionCardProps {
  label: string; // 'A', 'B', 'C', 'D'
  content: string;
  isSelected: boolean;
  isCorrect?: boolean; // For solutions view
  isWrong?: boolean;   // For solutions view (selected by user but incorrect)
  onClick?: () => void;
  disabled?: boolean;
}

export default function OptionCard({ 
  label, 
  content, 
  isSelected, 
  isCorrect = false, 
  isWrong = false, 
  onClick, 
  disabled = false 
}: OptionCardProps) {
  let baseClass = "w-full p-4 border rounded-xl flex items-center gap-4 text-left transition-all duration-200 outline-none text-base cursor-pointer";
  let borderClass = "border-[#334155]/60 bg-[#1E293B]/40 hover:bg-[#1E293B]/70 hover:border-[#3B82F6]/30 text-[#CBD5E1]";
  let labelBgClass = "bg-[#0F172A] text-[#CBD5E1] border border-[#334155]/60";

  if (disabled) {
    baseClass += " cursor-default pointer-events-none";
  }

  // Visual states logic
  if (isCorrect) {
    // Correct option (should be highlighted green in solution review)
    borderClass = "border-[#22C55E] bg-[#22C55E]/10 text-[#F8FAFC]";
    labelBgClass = "bg-[#22C55E] text-[#0F172A] border border-[#22C55E]";
  } else if (isWrong) {
    // Wrong option selected by user
    borderClass = "border-[#EF4444] bg-[#EF4444]/10 text-[#F8FAFC]";
    labelBgClass = "bg-[#EF4444] text-white border border-[#EF4444]";
  } else if (isSelected) {
    // Active selection state in active test mode
    borderClass = "border-[#3B82F6] bg-[#3B82F6]/10 text-[#F8FAFC]";
    labelBgClass = "bg-[#3B82F6] text-[#0F172A] border border-[#3B82F6]";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${borderClass}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${labelBgClass}`}>
        {label}
      </div>
      <div className="flex-1 select-none font-medium leading-relaxed">
        <LatexRenderer text={content} />
      </div>
    </button>
  );
}
