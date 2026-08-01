import React from 'react';

export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="p-6 bg-[#1E293B]/80 border border-[#334155]/60 rounded-xl animate-pulse space-y-4 relative overflow-hidden"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 bg-[#334155]/80 rounded-md w-1/3"></div>
            <div className="h-6 bg-[#334155]/60 rounded-lg w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[#334155]/50 rounded-md w-full"></div>
            <div className="h-4 bg-[#334155]/50 rounded-md w-5/6"></div>
          </div>
          <div className="flex gap-4 pt-2">
            <div className="h-8 bg-[#334155]/80 rounded-xl w-1/4"></div>
            <div className="h-8 bg-[#334155]/80 rounded-xl w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
