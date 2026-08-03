import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Attempt, Test } from '../lib/types';
import { getMotivationalQuote } from '../lib/db';

interface ContinueLearningCardProps {
  unfinishedAttempt: Attempt | null;
  test: Test | null;
}

export default function ContinueLearningCard({ unfinishedAttempt, test }: ContinueLearningCardProps) {
  const [showQuote, setShowQuote] = useState(true);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(getMotivationalQuote());
  }, [unfinishedAttempt]);

  const refreshQuote = () => {
    setQuote(getMotivationalQuote());
  };

  // Calculate progress stats
  let answeredCount = 0;
  let progressPct = 0;
  if (unfinishedAttempt && test) {
    const responsesList = Object.values(unfinishedAttempt.responses);
    answeredCount = responsesList.filter(r => r.selectedOptionIndex !== null).length;
    progressPct = test.questionsCount > 0 ? Math.round((answeredCount / test.questionsCount) * 100) : 0;
  }

  return (
    <div className="w-full space-y-4">
      {/* Motivation Toggle Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary-custom">Your Progress</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary-custom">Daily Motivation</span>
          <button 
            onClick={() => setShowQuote(!showQuote)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer duration-200 outline-none ${
              showQuote ? 'bg-primary-custom' : 'bg-[#334155]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-background-custom transition-transform duration-200 ${
              showQuote ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Motivational Quote Render */}
      {showQuote && quote && (
        <div className="p-4 bg-primary-custom/5 border-l-4 border-primary-custom rounded-r-xl italic text-sm text-text-secondary-custom shadow-sm relative group cursor-pointer" onClick={refreshQuote}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-custom/60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          &quot;{quote}&quot;
        </div>
      )}

      <div>
        {/* Continue Learning card */}
        {unfinishedAttempt && test ? (
          <div className="p-6 bg-gradient-to-br from-surface-custom to-surface-custom/80 border border-[#334155]/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-warning-custom/10 text-warning-custom rounded-full uppercase tracking-wider">
                  In Progress
                </span>
                <span className="text-xs font-semibold text-text-secondary-custom">
                  {answeredCount} of {test.questionsCount} questions answered ({progressPct}%)
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary-custom leading-snug">
                {test.title}
              </h3>
              
              {/* Progress bar */}
              <div className="w-full bg-background-custom rounded-full h-1.5 max-w-md overflow-hidden">
                <div 
                  className="bg-warning-custom h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <Link 
              href={`/test?attemptId=${unfinishedAttempt.id}`}
              className="w-full sm:w-auto text-center bg-warning-custom hover:bg-warning-custom/90 text-background-custom px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer block whitespace-nowrap"
            >
              Resume Test
            </Link>
          </div>
        ) : (
          <div className="p-6 bg-surface-custom border border-[#334155]/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 bg-primary-custom/10 rounded-full flex items-center justify-center text-primary-custom">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-text-primary-custom">No Unfinished Tests</h4>
          </div>
        )}
      </div>
    </div>
  );
}
