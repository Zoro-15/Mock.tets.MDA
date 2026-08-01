'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Attempt, Test, Question, QuestionResponse } from '../../lib/types';
import { getAttempt, getTestById, getQuestionsForTest, getLeaderboardForTest, syncAttemptProgress, submitAttemptToSupabase } from '../../lib/db';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Timer from '../../components/Timer';
import QuestionCard from '../../components/QuestionCard';
import OptionCard from '../../components/OptionCard';
import QuestionPalette from '../../components/QuestionPalette';
import SubmitDialog from '../../components/SubmitDialog';
import ThemeToggle from '../../components/ThemeToggle';
import { preload } from 'swr';

function ActiveTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId') || '';

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Time spent per question tracker - stored in mutable ref to avoid continuous state re-triggering
  const timeSpentRef = useRef<Record<string, number>>({});

  // Fetch initial details
  useEffect(() => {
    async function init() {
      if (attemptId) {
        const att = await getAttempt(attemptId);
        if (att) {
          setAttempt(att);
          const t = getTestById(att.testId);
          if (t) setTest(t);
          const q = await getQuestionsForTest(att.testId);
          setQuestions(q);
          
          // Populate dynamic responses
          const activeResponses = { ...att.responses };
          let updated = false;
          q.forEach(question => {
            if (!activeResponses[question.id]) {
              activeResponses[question.id] = {
                questionId: question.id,
                selectedOptionIndex: null,
                timeSpent: 0,
                status: 'unseen'
              };
              updated = true;
            }
          });
          if (updated && q.length > 0 && activeResponses[q[0].id].status === 'unseen') {
            activeResponses[q[0].id].status = 'unattempted';
          }

          setCurrentIndex(att.currentQuestionIndex);
          setResponses(activeResponses);
          setTimeLeft(att.timeLeft);
          
          // Initialize timeSpentRef from loaded responses
          const initialTimeSpent: Record<string, number> = {};
          Object.values(activeResponses).forEach(resp => {
            initialTimeSpent[resp.questionId] = resp.timeSpent;
          });
          timeSpentRef.current = initialTimeSpent;
        }
      }
      setLoading(false);
    }
    init();
  }, [attemptId]);

  const activeQuestion = questions[currentIndex];

  // Auto-save helper
  const saveProgress = useCallback((
    updatedResponses: Record<string, QuestionResponse>,
    updatedTimeLeft: number,
    updatedIdx: number
  ) => {
    if (!attemptId) return;
    syncAttemptProgress(attemptId, updatedResponses, updatedTimeLeft, updatedIdx);
  }, [attemptId]);

  // Submit helper
  const handleFinalSubmit = useCallback(async () => {
    if (!attemptId) return;
    // Combine current timeSpentRef into responses
    const finalResponses = { ...responses };
    Object.keys(finalResponses).forEach(qId => {
      finalResponses[qId] = {
        ...finalResponses[qId],
        timeSpent: timeSpentRef.current[qId] || 0
      };
    });

    await submitAttemptToSupabase(attemptId, finalResponses, timeLeft);
    
    // Preload analysis data instantly using SWR
    preload(attemptId ? `analysis-${attemptId}` : null, async () => {
      const att = await getAttempt(attemptId);
      if (!att) throw new Error("Attempt not found");
      const t = getTestById(att.testId);
      const q = await getQuestionsForTest(att.testId);
      const board = await getLeaderboardForTest(att.testId);
      return { attempt: att, test: t, questions: q, leaderboard: board };
    });
    
    router.push(`/analysis?attemptId=${attemptId}`);
  }, [attemptId, responses, timeLeft, router]);

  // Expiry auto-submit
  useEffect(() => {
    if (timeLeft <= 0 && !loading && attempt && !attempt.completed) {
      handleFinalSubmit();
    }
  }, [timeLeft, loading, attempt, handleFinalSubmit]);

  // Refs for timer dependencies to avoid tearing down the interval
  const timerStateRef = useRef({ responses, currentIndex, activeQuestion, saveProgress });
  useEffect(() => {
    timerStateRef.current = { responses, currentIndex, activeQuestion, saveProgress };
  }, [responses, currentIndex, activeQuestion, saveProgress]);

  // Clock tick interval
  useEffect(() => {
    if (loading || !attempt || attempt.completed || submitDialogOpen) return;

    const timer = setInterval(() => {
      const state = timerStateRef.current;
      
      // 1. Mutate timeSpentRef OUTSIDE the state updater to prevent React StrictMode double-ticks
      if (state.activeQuestion) {
        const currentQId = state.activeQuestion.id;
        timeSpentRef.current[currentQId] = (timeSpentRef.current[currentQId] || 0) + 1;
      }

      // 2. Pure state updater
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        
        // Auto-save every 10 seconds to localStorage
        if (nextTime % 10 === 0) {
          const responsesToSave = { ...state.responses };
          if (state.activeQuestion) {
            const currentQId = state.activeQuestion.id;
            responsesToSave[currentQId] = {
              ...responsesToSave[currentQId],
              timeSpent: timeSpentRef.current[currentQId]
            };
          }
          
          // Escape the state updater context to prevent double-saving in StrictMode
          setTimeout(() => {
            state.saveProgress(responsesToSave, nextTime, state.currentIndex);
          }, 0);
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attempt, submitDialogOpen]);

  // Action methods
  const selectOption = useCallback((optIdx: number) => {
    if (!activeQuestion) return;
    const qId = activeQuestion.id;
    const currentResp = responses[qId];

    const updated = {
      ...responses,
      [qId]: {
        ...currentResp,
        selectedOptionIndex: optIdx,
        status: (currentResp.status === 'marked' || currentResp.status === 'marked-attempted')
          ? 'marked-attempted' as const
          : 'attempted' as const
      }
    };
    
    setResponses(updated);
    saveProgress(updated, timeLeft, currentIndex);
  }, [activeQuestion, responses, timeLeft, currentIndex, saveProgress]);

  const handleClearResponse = useCallback(() => {
    if (!activeQuestion) return;
    const qId = activeQuestion.id;
    const currentResp = responses[qId];

    const updated = {
      ...responses,
      [qId]: {
        ...currentResp,
        selectedOptionIndex: null,
        status: currentResp.status === 'marked-attempted'
          ? 'marked' as const
          : 'unattempted' as const
      }
    };

    setResponses(updated);
    saveProgress(updated, timeLeft, currentIndex);
  }, [activeQuestion, responses, timeLeft, currentIndex, saveProgress]);

  const handleSaveAndNext = useCallback(() => {
    if (!activeQuestion) return;
    const nextIdx = currentIndex + 1;
    
    // Combine current time spent ref before navigating
    const updatedResponses = { ...responses };
    const qId = activeQuestion.id;
    updatedResponses[qId] = {
      ...updatedResponses[qId],
      timeSpent: timeSpentRef.current[qId] || 0
    };

    // If next question is unseen, mark it as unattempted (visited)
    if (nextIdx < questions.length) {
      const nextQ = questions[nextIdx];
      if (updatedResponses[nextQ.id]?.status === 'unseen') {
        updatedResponses[nextQ.id] = {
          ...updatedResponses[nextQ.id],
          status: 'unattempted'
        };
      }
      
      setResponses(updatedResponses);
      setCurrentIndex(nextIdx);
      saveProgress(updatedResponses, timeLeft, nextIdx);
    } else {
      // Last question - just save progress
      setResponses(updatedResponses);
      saveProgress(updatedResponses, timeLeft, currentIndex);
    }
  }, [activeQuestion, responses, questions, timeLeft, currentIndex, saveProgress]);

  const handleMarkAndNext = useCallback(() => {
    if (!activeQuestion) return;
    const qId = activeQuestion.id;
    const currentResp = responses[qId];
    const isAnswered = currentResp.selectedOptionIndex !== null;

    const updatedResponses = { ...responses };
    updatedResponses[qId] = {
      ...currentResp,
      timeSpent: timeSpentRef.current[qId] || 0,
      status: isAnswered ? 'marked-attempted' as const : 'marked' as const
    };

    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      const nextQ = questions[nextIdx];
      if (updatedResponses[nextQ.id]?.status === 'unseen') {
        updatedResponses[nextQ.id] = {
          ...updatedResponses[nextQ.id],
          status: 'unattempted'
        };
      }
      setResponses(updatedResponses);
      setCurrentIndex(nextIdx);
      saveProgress(updatedResponses, timeLeft, nextIdx);
    } else {
      setResponses(updatedResponses);
      saveProgress(updatedResponses, timeLeft, currentIndex);
    }
  }, [activeQuestion, responses, questions, timeLeft, currentIndex, saveProgress]);

  const handleSelectIndex = (idx: number) => {
    // Save current question time spent before switching
    if (activeQuestion) {
      const qId = activeQuestion.id;
      responses[qId] = {
        ...responses[qId],
        timeSpent: timeSpentRef.current[qId] || 0
      };
    }

    const updatedResponses = { ...responses };
    const targetQ = questions[idx];
    if (updatedResponses[targetQ.id]?.status === 'unseen') {
      updatedResponses[targetQ.id] = {
        ...updatedResponses[targetQ.id],
        status: 'unattempted'
      };
    }

    setResponses(updatedResponses);
    setCurrentIndex(idx);
    saveProgress(updatedResponses, timeLeft, idx);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      
      if (['1', '2', '3', '4'].includes(key)) {
        e.preventDefault();
        selectOption(parseInt(key) - 1);
      } else if (key === 'N') {
        e.preventDefault();
        handleSaveAndNext();
      } else if (key === 'M') {
        e.preventDefault();
        handleMarkAndNext();
      } else if (key === 'C') {
        e.preventDefault();
        handleClearResponse();
      } else if (key === 'P') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, responses, timeLeft, selectOption, handleSaveAndNext, handleMarkAndNext, handleClearResponse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-custom flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attempt || !test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background-custom flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <EmptyState title="Attempt Session Error" message="We could not load this test session. It may have expired or been submitted." />
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-primary-custom text-white rounded-xl text-sm font-semibold">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  // Count active stats for dialog
  const list = Object.values(responses);
  const attemptedCount = list.filter(r => r.selectedOptionIndex !== null).length;
  const unattemptedCount = list.filter(r => r.selectedOptionIndex === null && r.status === 'unattempted').length;
  const markedCount = list.filter(r => r.status === 'marked' || r.status === 'marked-attempted').length;

  const positiveMarks = test.marks / test.questionsCount;

  return (
    <div className="min-h-screen bg-background-custom text-text-primary-custom flex flex-col justify-between select-none">
      
      {/* Top Navbar */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/95 backdrop-blur-md sticky top-0 z-40 shadow-md">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary-custom transition-all duration-500 rounded-r-full" style={{ width: `${(attemptedCount / questions.length) * 100}%` }} />
        
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 max-w-[60%]">
            <button 
              onClick={() => setSubmitDialogOpen(true)}
              className="text-text-secondary-custom hover:text-text-primary-custom p-1.5 hover:bg-background-custom/40 rounded-lg cursor-pointer transition-colors"
              title="Exit test"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3.007-3H18m-3-3 3 3-3 3" />
              </svg>
            </button>
            <h1 className="font-bold text-sm sm:text-base text-text-primary-custom truncate" title={test.title}>
              {test.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Timer component */}
            <Timer timeLeft={timeLeft} />

            {/* Language Placeholder icon */}
            <div className="w-8 h-8 rounded-lg bg-background-custom/40 border border-[#334155]/60 flex items-center justify-center text-text-secondary-custom" title="English Only">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896 3.066 2.19 5.752 3.816 7.778" />
              </svg>
            </div>

            {/* Palette toggle button */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="p-2 bg-primary-custom hover:bg-primary-custom/90 text-white rounded-lg cursor-pointer md:hidden shadow-sm"
              title="Open palette"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Section */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Question Panel */}
        <div className="flex-1 flex flex-col justify-between space-y-6 pr-1">
          {activeQuestion ? (
            <div className="space-y-6">
              {/* Section Header */}
              {activeQuestion.section && (
                <div className="bg-surface-custom/70 border border-[#334155]/60 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-custom"></span>
                  <span className="text-sm font-bold text-text-primary-custom">{activeQuestion.section}</span>
                </div>
              )}
              {/* Question Card */}
              <QuestionCard
                question={activeQuestion}
                questionNumber={currentIndex + 1}
                timeSpent={timeSpentRef.current[activeQuestion.id] || 0}
                positiveMarks={positiveMarks}
                negativeMarks={test.negativeMarking}
              />

              {/* Answer options */}
              <div className="grid grid-cols-1 gap-4">
                {activeQuestion.options.map((opt, i) => (
                  <OptionCard
                    key={i}
                    label={['A', 'B', 'C', 'D'][i]}
                    content={opt}
                    isSelected={responses[activeQuestion.id]?.selectedOptionIndex === i}
                    onClick={() => selectOption(i)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="End of Test" message="You have navigated past all questions. Open palette to submit." />
          )}

          {/* Spacer to push buttons down */}
          <div className="flex-grow" />

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#334155]/40 pt-4 bg-background-custom sticky bottom-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAndNext}
                className="px-5 py-3 bg-warning-custom/10 hover:bg-warning-custom/20 active:scale-95 border border-warning-custom/50 text-warning-custom rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer outline-none"
              >
                MARK & NEXT
              </button>
              <button
                onClick={handleClearResponse}
                className="px-5 py-3 border border-[#334155]/60 text-text-secondary-custom hover:text-text-primary-custom hover:bg-surface-custom/40 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer outline-none"
              >
                CLEAR RESPONSE
              </button>
            </div>
            
            <button
              onClick={handleSaveAndNext}
              className="px-6 py-3 bg-primary-custom hover:bg-[#2563EB] active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-primary-custom/20 hover:shadow-primary-custom/40 cursor-pointer outline-none"
            >
              SAVE & NEXT
            </button>
          </div>
        </div>

        {/* Right Side: Palette Panel (pinned on desktop, drawer on mobile) */}
        <div className="hidden md:block w-80">
          <QuestionPalette
            questions={questions}
            responses={responses}
            currentIndex={currentIndex}
            onSelectIndex={handleSelectIndex}
            onSubmitClick={() => setSubmitDialogOpen(true)}
            isOpen={paletteOpen}
            onClose={() => setPaletteOpen(false)}
          />
        </div>
      </div>

      {/* Floating Palette Drawer for Mobile viewports */}
      <div className="md:hidden">
        <QuestionPalette
          questions={questions}
          responses={responses}
          currentIndex={currentIndex}
          onSelectIndex={handleSelectIndex}
          onSubmitClick={() => setSubmitDialogOpen(true)}
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />
      </div>

      {/* Submit Confirmation dialog */}
      <SubmitDialog
        isOpen={submitDialogOpen}
        timeLeft={timeLeft}
        attemptedCount={attemptedCount}
        unattemptedCount={unattemptedCount}
        markedCount={markedCount}
        onConfirm={handleFinalSubmit}
        onCancel={() => setSubmitDialogOpen(false)}
      />
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-custom flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ActiveTestContent />
    </Suspense>
  );
}
