import React from 'react';
import LatexRenderer from './LatexRenderer';
import { motion } from 'framer-motion';

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
  let borderClass = "border-[#334155]/60 bg-surface-custom/40 hover:bg-surface-custom/70 hover:border-primary-custom/30 text-text-secondary-custom";
  let labelBgClass = "bg-background-custom text-text-secondary-custom border border-[#334155]/60";

  if (disabled) {
    baseClass += " cursor-default pointer-events-none";
  }

  // Visual states logic
  if (isCorrect) {
    // Correct option (should be highlighted green in solution review)
    borderClass = "border-success-custom bg-success-custom/10 text-text-primary-custom shadow-[0_0_15px_rgba(34,197,94,0.2)]";
    labelBgClass = "bg-success-custom text-background-custom border border-success-custom";
  } else if (isWrong) {
    // Wrong option selected by user
    borderClass = "border-danger-custom bg-danger-custom/10 text-text-primary-custom shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    labelBgClass = "bg-danger-custom text-white border border-danger-custom";
  } else if (isSelected) {
    // Active selection state in active test mode
    borderClass = "border-primary-custom bg-primary-custom/10 text-text-primary-custom shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-primary-custom/50";
    labelBgClass = "bg-primary-custom text-background-custom border border-primary-custom";
  }
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01, x: 2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
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
    </motion.button>
  );
}
