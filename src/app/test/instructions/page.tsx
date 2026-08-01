'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Test } from '../../../lib/types';
import { getTestById, createAttempt } from '../../../lib/db';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

function InstructionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('id') || '';

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      const t = getTestById(testId);
      if (t) setTest(t);
    }
    setLoading(false);
  }, [testId]);

  const handleStartTest = async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const attempt = await createAttempt(testId);
      if (attempt) {
        router.push(`/test?attemptId=${attempt.id}`);
      }
    } catch (e) {
      console.error('Failed to create test attempt:', e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-custom flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background-custom flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <EmptyState title="Test Not Found" message="The requested test does not exist or has been removed." />
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-primary-custom text-white rounded-xl text-sm font-semibold">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-custom text-text-primary-custom flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-text-secondary-custom hover:text-text-primary-custom p-1.5 bg-background-custom/40 rounded-lg border border-[#334155]/60 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-extrabold text-lg text-text-primary-custom">Test Instructions</h1>
            <p className="text-[10px] text-text-secondary-custom/60 font-bold uppercase tracking-wider">{test.title}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-surface-custom border border-[#334155]/60 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Title Section */}
          <div className="border-b border-[#334155]/60 pb-5 space-y-1">
            <span className="text-xs font-bold text-primary-custom uppercase tracking-wider">NDA Preparation</span>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary-custom">{test.title}</h2>
          </div>

          {/* Test Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-background-custom/40 border border-[#334155]/30 rounded-xl p-4 font-mono text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-secondary-custom/60 font-bold uppercase">Questions</span>
              <p className="text-lg font-bold text-text-primary-custom">{test.questionsCount}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-secondary-custom/60 font-bold uppercase">Duration</span>
              <p className="text-lg font-bold text-text-primary-custom">{test.duration} mins</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-secondary-custom/60 font-bold uppercase">Total Marks</span>
              <p className="text-lg font-bold text-text-primary-custom">{test.marks}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-secondary-custom/60 font-bold uppercase">Neg. Mark</span>
              <p className="text-lg font-bold text-danger-custom">-{test.negativeMarking}</p>
            </div>
          </div>

          {/* Rules and Guidelines */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary-custom uppercase tracking-wider">Exam Guidelines</h3>
            <ul className="text-sm text-text-secondary-custom space-y-2.5 list-disc list-inside leading-relaxed">
              <li>This test has a strict countdown timer. Ensure you finish before time runs out.</li>
              <li>Each correct response awards points according to the standard scoring scheme.</li>
              <li>A penalty of <strong className="text-danger-custom font-medium">-{test.negativeMarking} marks</strong> is deducted for every incorrect response. There is no penalty for unattempted questions.</li>
              <li>You can navigate back and forth between questions using the numbers in the right-side question palette.</li>
              <li>Keyboard shortcuts:
                <ul className="pl-6 mt-1.5 space-y-1 list-circle">
                  <li><kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">1</kbd> - <kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">4</kbd>: Select answers A to D</li>
                  <li><kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">N</kbd>: Save & Next</li>
                  <li><kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">M</kbd>: Mark for Review</li>
                  <li><kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">C</kbd>: Clear Response</li>
                  <li><kbd className="bg-background-custom px-1.5 py-0.5 border border-[#334155] rounded text-xs font-mono">P</kbd>: Toggle Question Palette drawer</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Syllabus Section */}
          {test.syllabus && test.syllabus.length > 0 && (
            <div className="space-y-2 bg-background-custom/20 border border-[#334155]/40 rounded-xl p-4">
              <h3 className="text-xs font-bold text-text-secondary-custom uppercase tracking-wider">Test Syllabus</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {test.syllabus.map((syl, i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface-custom border border-[#334155]/60 text-text-secondary-custom rounded-lg text-xs font-semibold">
                    {syl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleStartTest}
              className="w-full py-3.5 bg-primary-custom hover:bg-primary-custom/90 text-white rounded-xl font-bold text-sm tracking-wide shadow-md shadow-primary-custom/10 transition-colors cursor-pointer outline-none"
            >
              START TEST
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto px-4 py-6 text-center text-xs text-text-secondary-custom/40 border-t border-[#334155]/30">
        NDA Mock Test Platform Instructions &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function TestInstructionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-custom flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <InstructionsContent />
    </Suspense>
  );
}
