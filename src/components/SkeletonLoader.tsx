import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((n) => (
        <div 
          key={n} 
          className="p-6 bg-[#1E293B] border border-[#334155]/50 rounded-xl animate-pulse space-y-3"
        >
          <div className="h-4 bg-[#334155] rounded w-2/3"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-[#334155] rounded w-1/4"></div>
            <div className="h-3 bg-[#334155] rounded w-1/4"></div>
            <div className="h-3 bg-[#334155] rounded w-1/4"></div>
          </div>
          <div className="h-8 bg-[#334155]/60 rounded-xl w-32 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}
