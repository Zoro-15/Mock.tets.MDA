import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatsCard({ title, value, subtitle, icon, accentColor = 'primary' }: StatsCardProps) {
  let borderHoverClass = 'hover:border-[#3B82F6]/30';
  let iconBgClass = 'bg-[#3B82F6]/10 text-[#3B82F6]';

  if (accentColor === 'success') {
    borderHoverClass = 'hover:border-[#22C55E]/30';
    iconBgClass = 'bg-[#22C55E]/10 text-[#22C55E]';
  } else if (accentColor === 'warning') {
    borderHoverClass = 'hover:border-[#F59E0B]/30';
    iconBgClass = 'bg-[#F59E0B]/10 text-[#F59E0B]';
  } else if (accentColor === 'danger') {
    borderHoverClass = 'hover:border-[#EF4444]/30';
    iconBgClass = 'bg-[#EF4444]/10 text-[#EF4444]';
  }

  let valueColorClass = 'text-[#F8FAFC]';
  if (accentColor === 'success') valueColorClass = 'text-[#22C55E]';
  else if (accentColor === 'warning') valueColorClass = 'text-[#F59E0B]';
  else if (accentColor === 'danger') valueColorClass = 'text-[#EF4444]';
  else if (accentColor === 'primary') valueColorClass = 'text-[#3B82F6]';

  return (
    <div className={`p-5 bg-[#1E293B] border border-[#334155]/60 rounded-xl transition-all duration-200 ${borderHoverClass} flex items-start justify-between gap-3`}>
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-[#CBD5E1] uppercase tracking-wider block">
          {title}
        </span>
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${valueColorClass} drop-shadow-md`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[#CBD5E1]/60 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div className={`p-2.5 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
