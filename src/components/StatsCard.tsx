import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatsCard({ title, value, subtitle, icon, accentColor = 'primary' }: StatsCardProps) {
  let borderHoverClass = 'hover:border-primary-custom/30';
  let iconBgClass = 'bg-primary-custom/10 text-primary-custom';

  if (accentColor === 'success') {
    borderHoverClass = 'hover:border-success-custom/30';
    iconBgClass = 'bg-success-custom/10 text-success-custom';
  } else if (accentColor === 'warning') {
    borderHoverClass = 'hover:border-warning-custom/30';
    iconBgClass = 'bg-warning-custom/10 text-warning-custom';
  } else if (accentColor === 'danger') {
    borderHoverClass = 'hover:border-danger-custom/30';
    iconBgClass = 'bg-danger-custom/10 text-danger-custom';
  }

  let valueColorClass = 'text-text-primary-custom';
  if (accentColor === 'success') valueColorClass = 'text-success-custom';
  else if (accentColor === 'warning') valueColorClass = 'text-warning-custom';
  else if (accentColor === 'danger') valueColorClass = 'text-danger-custom';
  else if (accentColor === 'primary') valueColorClass = 'text-primary-custom';

  return (
    <div className={`p-5 bg-surface-custom border border-[#334155]/60 rounded-xl transition-all duration-200 ${borderHoverClass} flex items-start justify-between gap-3`}>
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-text-secondary-custom uppercase tracking-wider block">
          {title}
        </span>
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${valueColorClass} drop-shadow-md`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-text-secondary-custom/60 font-medium">
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
