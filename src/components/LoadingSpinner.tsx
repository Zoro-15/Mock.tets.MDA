import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-10 h-10 border-4 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin"></div>
    </div>
  );
}
