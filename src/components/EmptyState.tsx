import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ 
  title = "No Tests Found", 
  message = "Please check back later or try selecting another category." 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-custom border border-[#334155]/30 rounded-2xl max-w-md mx-auto my-8">
      <div className="w-16 h-16 bg-primary-custom/10 rounded-full flex items-center justify-center mb-4 text-primary-custom">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="text-text-primary-custom font-semibold text-lg mb-1">{title}</h3>
      <p className="text-text-secondary-custom text-sm">{message}</p>
    </div>
  );
}
