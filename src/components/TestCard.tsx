import React from 'react';
import Link from 'next/link';
import { Test } from '../lib/types';
import { getQuestionsForTest } from '../lib/db';

interface TestCardProps {
  test: Test;
  status: 'not_started' | 'paused' | 'completed';
  attemptId?: string;
}

export default function TestCard({ test, status, attemptId }: TestCardProps) {
  let buttonLabel = "Start Test";
  let buttonLink = `/test/instructions?id=${test.id}`;
  let buttonClass = "bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white";

  if (status === 'paused' && attemptId) {
    buttonLabel = "Resume Test";
    buttonLink = `/test?attemptId=${attemptId}`;
    buttonClass = "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0F172A]";
  } else if (status === 'completed' && attemptId) {
    buttonLabel = "View Analysis";
    buttonLink = `/analysis?attemptId=${attemptId}`;
    buttonClass = "border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10";
  }

  const handlePrefetch = () => {
    // Warm up cache / trigger background database query
    getQuestionsForTest(test.id).catch(() => {});
  };

  return (
    <div 
      onMouseEnter={handlePrefetch}
      className="p-6 bg-[#1E293B] border border-[#334155]/60 hover:border-[#3B82F6]/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:scale-[1.01] transition-all duration-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group"
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-[#F8FAFC] tracking-tight">{test.title}</h3>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#CBD5E1]">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#3B82F6]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            <span>{test.questionsCount} Questions</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#3B82F6]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{test.duration} Minutes</span>
          </div>

          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#22C55E]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{test.marks} Marks</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status === 'completed' && (
          <Link
            href={`/test/instructions?id=${test.id}`}
            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-center w-full md:w-auto shadow-sm cursor-pointer bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
          >
            Reattempt Test
          </Link>
        )}
        <Link 
          href={buttonLink} 
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-center w-full md:w-auto shadow-sm cursor-pointer ${buttonClass}`}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
