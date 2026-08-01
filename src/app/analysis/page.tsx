'use client';

import React, { useState, Suspense, useTransition, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Attempt, Test, Question, LeaderboardEntry } from '../../lib/types';
import { getAttempt, getTestById, getQuestionsForTest, getLeaderboardForTest } from '../../lib/db';
import { generateSubjectAnalytics } from '../../lib/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import StatsCard from '../../components/StatsCard';
import SolutionCard from '../../components/SolutionCard';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId') || '';

  const [activeTab, setActiveTab] = useState<'analysis' | 'solutions' | 'leaderboard'>('analysis');
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [isPending, startTransition] = useTransition();
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleFilterChange = (filter: 'all' | 'correct' | 'incorrect' | 'unattempted') => {
    startTransition(() => {
      setSolutionFilter(filter);
      setVisibleCount(10);
    });
  };

  useEffect(() => {
    if (activeTab !== 'solutions' || isPending) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [activeTab, isPending]);

  const fetcher = async (id: string) => {
    const attemptIdStr = id.replace('analysis-', '');
    const att = await getAttempt(attemptIdStr);
    if (!att) throw new Error("Attempt not found");
    const t = getTestById(att.testId);
    if (!t) throw new Error("Test not found");
    const q = await getQuestionsForTest(att.testId);
    const board = await getLeaderboardForTest(att.testId);
    return { attempt: att, test: t, questions: q, leaderboard: board };
  };

  const { data, error, isLoading } = useSWR(
    attemptId ? `analysis-${attemptId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleTabChange = (tab: 'analysis' | 'solutions' | 'leaderboard') => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-8 max-w-5xl mx-auto space-y-6">
        <SkeletonLoader count={4} />
      </div>
    );
  }

  if (error || !data || !data.attempt || !data.test || data.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <EmptyState title="Report Error" message="We could not load this analysis report. It may have been cleared or removed." />
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-semibold">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, test, questions, leaderboard } = data;

  // Format time taken
  const formatTimeTaken = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  // Derived states
  const attemptedCount = attempt.correctCount + attempt.incorrectCount;
  const avgTime = attemptedCount > 0 ? Math.round(attempt.timeTaken / attemptedCount) : 0;

  const topicInsights = questions.length && attempt 
    ? generateSubjectAnalytics(questions, attempt.responses)
    : [];

  // Solution items based on filters
  const filteredQuestions = questions.map((q, idx) => ({ q, idx: idx + 1 })).filter(({ q }) => {
    const resp = attempt.responses[q.id];
    const isAnswered = resp && resp.selectedOptionIndex !== null;
    const isCorrect = isAnswered && resp.selectedOptionIndex === q.correctOptionIndex;
    const isWrong = isAnswered && resp.selectedOptionIndex !== q.correctOptionIndex;

    if (solutionFilter === 'correct') return isCorrect;
    if (solutionFilter === 'incorrect') return isWrong;
    if (solutionFilter === 'unattempted') return !isAnswered;
    return true; // 'all'
  });

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-[#1E293B]/85 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#CBD5E1] hover:text-[#F8FAFC] p-1.5 bg-[#0F172A]/40 rounded-lg border border-[#334155]/60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-[#F8FAFC]">Performance Report</h1>
              <p className="text-[10px] text-[#CBD5E1]/60 font-bold uppercase tracking-wider">{test.title}</p>
            </div>
          </div>

          <Link 
            href="/"
            className="px-4 py-2 border border-[#334155]/60 text-xs sm:text-sm font-semibold rounded-xl text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E293B]/40 transition-all cursor-pointer"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#334155]">
          {(['analysis', 'solutions', leaderboard && leaderboard.length > 0 ? 'leaderboard' : null].filter(Boolean) as ('analysis' | 'solutions' | 'leaderboard')[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-6 text-sm font-semibold capitalize transition-all relative cursor-pointer outline-none ${
                  isActive ? 'text-[#3B82F6]' : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}

        {isPending ? (
          <div className="space-y-6 mt-6">
            <SkeletonLoader count={3} />
          </div>
        ) : (
          <>
            {/* 1. ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              <div className="space-y-6 animate-fadeIn">
            {/* Summary cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Score"
                value={`${attempt.score} / ${test.marks}`}
                subtitle={`Target: ${Math.round(test.marks * 0.4)} (Cutoff approx)`}
                accentColor={attempt.score >= test.marks * 0.4 ? 'success' : 'warning'}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.75a1.125 1.125 0 0 1-1.125-1.125V11.25M9 18.75V15.375c0-.621.504-1.125 1.125-1.125h.75A1.125 1.125 0 0 1 12 15.375V18.75m9-13.5h-18M21 5.25v3.375C21 9.246 20.496 9.75 19.875 9.75H4.125C3.504 9.75 3 9.246 3 8.625V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                  </svg>
                }
              />
              <StatsCard
                title="Accuracy"
                value={`${attempt.accuracy}%`}
                subtitle="Percentage of correct answers"
                accentColor={attempt.accuracy >= 80 ? 'success' : attempt.accuracy >= 50 ? 'warning' : 'danger'}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                }
              />
              <StatsCard
                title="Percentile"
                value={`${attempt.percentile}%`}
                subtitle="Relative standing among peers"
                accentColor="primary"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  </svg>
                }
              />
            </div>

            {/* Answer Distribution Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Card 1: Answers Breakdown */}
              <div className="bg-[#1E293B] border border-[#334155]/60 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                  Question Breakdown
                </h3>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center text-[#CBD5E1]">
                    <span>Total Questions</span>
                    <span className="font-bold text-[#F8FAFC]">{questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#CBD5E1]">
                    <span>Attempted</span>
                    <span className="font-bold text-[#3B82F6]">{attemptedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#22C55E]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      Correct
                    </span>
                    <span className="font-bold">{attempt.correctCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#EF4444]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      Incorrect
                    </span>
                    <span className="font-bold">{attempt.incorrectCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#CBD5E1]/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#334155]" />
                      Unattempted
                    </span>
                    <span className="font-bold">{attempt.unattemptedCount}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Time Analytics */}
              <div className="bg-[#1E293B] border border-[#334155]/60 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                  Time Analysis
                </h3>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center text-[#CBD5E1]">
                    <span>Total Duration</span>
                    <span className="font-bold text-[#F8FAFC]">{test.duration} mins</span>
                  </div>
                  <div className="flex justify-between items-center text-[#CBD5E1]">
                    <span>Time Taken</span>
                    <span className="font-bold text-[#F8FAFC]">{formatTimeTaken(attempt.timeTaken)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#CBD5E1]">
                    <span>Average Time / Question</span>
                    <span className="font-bold text-[#3B82F6]">{avgTime} seconds</span>
                  </div>
                  <div className="flex justify-between items-center text-[#CBD5E1]/60">
                    <span>Remaining Time (leftover)</span>
                    <span className="font-bold">{formatTimeTaken(attempt.timeLeft)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: TOPIC INSIGHTS */}
            <div className="bg-[#1E293B] border border-[#334155]/60 rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider pb-2 border-b border-[#334155]/40">
                Deep Topic Analytics
              </h3>
              
              <div className="space-y-6">
                {topicInsights.map(insight => (
                  <div key={insight.topic} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-[#F8FAFC]">{insight.topic} <span className="text-xs text-[#CBD5E1]/60 font-mono ml-1">({insight.total} Qs)</span></span>
                      <span className={insight.accuracy >= 70 ? 'text-[#22C55E]' : insight.accuracy >= 40 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}>
                        {insight.accuracy}% Accuracy
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#0F172A] rounded-full h-2.5 overflow-hidden flex ring-1 ring-[#334155]/50">
                      <div className="bg-[#22C55E] transition-all" style={{ width: `${(insight.correct / insight.total) * 100}%` }} title={`Correct: ${insight.correct}`} />
                      <div className="bg-[#EF4444] transition-all" style={{ width: `${(insight.incorrect / insight.total) * 100}%` }} title={`Incorrect: ${insight.incorrect}`} />
                    </div>
                    {/* Tiny Stats */}
                    <div className="flex justify-between text-[10px] font-mono text-[#CBD5E1]/70">
                      <span className="text-[#22C55E]">{insight.correct} Correct</span>
                      <span className="text-[#EF4444]">{insight.incorrect} Wrong</span>
                      <span>{insight.unattempted} Skipped</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. SOLUTIONS TAB */}
        {activeTab === 'solutions' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all', label: 'All Questions' },
                { id: 'correct', label: 'Correct' },
                { id: 'incorrect', label: 'Incorrect' },
                { id: 'unattempted', label: 'Unattempted' }
              ] as const).map((filter) => {
                const isActive = solutionFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer outline-none ${
                      isActive 
                        ? 'bg-[#3B82F6] border-[#3B82F6] text-white' 
                        : 'bg-[#1E293B] border-[#334155]/60 text-[#CBD5E1] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable solutions list */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-6">
                {visibleQuestions.map(({ q, idx }) => (
                  <div 
                    key={q.id} 
                    className="[content-visibility:auto] contain-intrinsic-size-[400px]"
                  >
                    <SolutionCard
                      question={q}
                      response={attempt.responses[q.id]}
                      questionNumber={idx}
                    />
                  </div>
                ))}
                {visibleCount < filteredQuestions.length && (
                  <div ref={observerTarget} className="py-6 flex justify-center">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="No Solutions Match Filter" message="Select a different filter chip above to view explanations." />
            )}
          </div>
        )}

        {/* 3. LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#1E293B] border border-[#334155]/60 rounded-2xl p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155]/40 pb-4">
              <h3 className="text-base font-bold text-[#F8FAFC]">Leaderboard (Simulation)</h3>
              <p className="text-xs text-[#CBD5E1]/60 leading-relaxed mt-0.5">
                See where you stand relative to the top scoring candidates who attempted this test.
              </p>
            </div>

            {/* Leaderboard list */}
            <div className="border border-[#334155]/60 rounded-xl overflow-hidden font-mono text-sm">
              <div className="grid grid-cols-12 bg-[#0F172A] border-b border-[#334155]/60 p-3.5 text-xs font-bold text-[#CBD5E1]/80 uppercase">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-4 pl-4">Name</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Accuracy</div>
                <div className="col-span-2 text-center">Time</div>
              </div>

              {/* Candidates */}
              {leaderboard.map((cand) => (
                <div 
                  key={cand.rank}
                  className="grid grid-cols-12 p-3.5 border-b border-[#334155]/30 hover:bg-[#1E293B]/50 transition-colors text-[#CBD5E1]"
                >
                  <div className="col-span-2 text-center font-bold text-[#3B82F6]">
                    #{cand.rank}
                  </div>
                  <div className="col-span-4 pl-4 text-[#F8FAFC] font-semibold truncate">
                    {cand.name}
                  </div>
                  <div className="col-span-2 text-center text-[#22C55E] font-semibold">
                    {cand.score}
                  </div>
                  <div className="col-span-2 text-center">
                    {cand.accuracy}%
                  </div>
                  <div className="col-span-2 text-center text-xs">
                    {cand.timeTaken}
                  </div>
                </div>
              ))}

              {/* Current user placement row */}
              <div className="grid grid-cols-12 p-4 bg-[#3B82F6]/10 border-t-2 border-[#3B82F6] text-[#F8FAFC]">
                <div className="col-span-2 text-center font-black">
                  #142
                </div>
                <div className="col-span-4 pl-4 font-bold truncate">
                  Aspirant (You)
                </div>
                <div className="col-span-2 text-center font-bold text-[#22C55E]">
                  {attempt.score}
                </div>
                <div className="col-span-2 text-center font-semibold">
                  {attempt.accuracy}%
                </div>
                <div className="col-span-2 text-center text-xs font-semibold">
                  {formatTimeTaken(attempt.timeTaken)}
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-[#CBD5E1]/40 text-center italic mt-2">
              Note: This is a static user interface template demonstrating the leaderboard structure. No real-time backend communication has been implemented.
            </p>
          </div>
        )}
          </>
        )}

      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
