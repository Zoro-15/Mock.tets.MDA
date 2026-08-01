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
import { preload } from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

function ActiveTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId') || '';

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [initialTime, setInitialTime] = useState(3600);
  const timeLeftRef = useRef(3600);
  const [expired, setExpired] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          setInitialTime(att.timeLeft);
          timeLeftRef.current = att.timeLeft;
          
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
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    
    // Combine current timeSpentRef into responses
    const finalResponses = { ...responses };
    Object.keys(finalResponses).forEach(qId => {
      finalResponses[qId] = {
        ...finalResponses[qId],
        timeSpent: timeSpentRef.current[qId] || 0
      };
    });

    try {
      await submitAttemptToSupabase(attemptId, finalResponses, timeLeftRef.current);
      
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
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }, [attemptId, responses, router, isSubmitting]);

  // Pause helper
  const handlePause = useCallback(() => {
    if (!attemptId) return;
    const currentResponses = { ...responses };
    Object.keys(currentResponses).forEach(qId => {
      currentResponses[qId] = {
        ...currentResponses[qId],
        timeSpent: timeSpentRef.current[qId] || 0
      };
    });
    saveProgress(currentResponses, timeLeftRef.current, currentIndex);
    router.push('/');
  }, [attemptId, responses, currentIndex, saveProgress, router]);

  // Expiry auto-submit
  useEffect(() => {
    if (expired && !loading && attempt && !attempt.completed) {
      handleFinalSubmit();
    }
  }, [expired, loading, attempt, handleFinalSubmit]);

  // Refs for timer dependencies to avoid tearing down the interval
  const timerStateRef = useRef({ responses, currentIndex, activeQuestion, saveProgress });
  useEffect(() => {
    timerStateRef.current = { responses, currentIndex, activeQuestion, saveProgress };
  }, [responses, currentIndex, activeQuestion, saveProgress]);

  // Clock tick callback handled by Timer component
  const handleTick = useCallback((newTime: number) => {
    timeLeftRef.current = newTime;
    const state = timerStateRef.current;
    
    if (newTime <= 0) {
      setExpired(true);
      return;
    }

    if (state.activeQuestion) {
      const currentQId = state.activeQuestion.id;
      timeSpentRef.current[currentQId] = (timeSpentRef.current[currentQId] || 0) + 1;
    }

    // Auto-save every 10 seconds to localStorage
    if (newTime > 0 && newTime % 10 === 0) {
      const responsesToSave = { ...state.responses };
      if (state.activeQuestion) {
        const currentQId = state.activeQuestion.id;
        responsesToSave[currentQId] = {
          ...responsesToSave[currentQId],
          timeSpent: timeSpentRef.current[currentQId]
        };
      }
      state.saveProgress(responsesToSave, newTime, state.currentIndex);
    }
  }, []);

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
    saveProgress(updated, timeLeftRef.current, currentIndex);
  }, [activeQuestion, responses, currentIndex, saveProgress]);

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
    saveProgress(updated, timeLeftRef.current, currentIndex);
  }, [activeQuestion, responses, currentIndex, saveProgress]);

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
      saveProgress(updatedResponses, timeLeftRef.current, nextIdx);
    } else {
      // Last question - just save progress
      setResponses(updatedResponses);
      saveProgress(updatedResponses, timeLeftRef.current, currentIndex);
    }
  }, [activeQuestion, responses, questions, currentIndex, saveProgress]);

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
      saveProgress(updatedResponses, timeLeftRef.current, nextIdx);
    } else {
      setResponses(updatedResponses);
      saveProgress(updatedResponses, timeLeftRef.current, currentIndex);
    }
  }, [activeQuestion, responses, questions, currentIndex, saveProgress]);

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
    saveProgress(updatedResponses, timeLeftRef.current, idx);
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
  }, [currentIndex, questions, responses, selectOption, handleSaveAndNext, handleMarkAndNext, handleClearResponse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attempt || !test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <EmptyState title="Attempt Session Error" message="We could not load this test session. It may have expired or been submitted." />
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-semibold">
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
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col justify-between select-none">
      
      {/* Top Navbar */}
      <header className="border-b border-[#334155]/60 bg-[#1E293B]/95 backdrop-blur-md sticky top-0 z-40 shadow-md">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-[#3B82F6] transition-all duration-500 rounded-r-full" style={{ width: `${(attemptedCount / questions.length) * 100}%` }} />
        
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 max-w-[60%]">
            <button 
              onClick={handlePause}
              className="text-[#CBD5E1] hover:text-[#F8FAFC] p-1.5 hover:bg-[#0F172A]/40 rounded-lg cursor-pointer transition-colors"
              title="Pause test"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            </button>
            <h1 className="font-bold text-sm sm:text-base text-[#F8FAFC] truncate" title={test.title}>
              {test.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer component */}
            <Timer initialTimeLeft={initialTime} onTick={handleTick} isPaused={loading || !attempt || attempt.completed || submitDialogOpen} />

            {/* Palette toggle button */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="w-8 h-8 flex items-center justify-center bg-[#1E293B] border border-[#334155]/60 hover:bg-[#334155]/60 text-[#CBD5E1] hover:text-[#F8FAFC] rounded-lg cursor-pointer md:hidden transition-colors"
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
          <AnimatePresence mode="wait">
            {activeQuestion ? (
              <motion.div 
                key={activeQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Section Header */}
                {activeQuestion.section && (
                  <div className="bg-[#1E293B]/70 border border-[#334155]/60 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                    <span className="text-sm font-bold text-[#F8FAFC]">{activeQuestion.section}</span>
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
              </motion.div>
            ) : (
              <EmptyState title="End of Test" message="You have navigated past all questions. Open palette to submit." />
            )}
          </AnimatePresence>

          {/* Spacer to push buttons down */}
          <div className="flex-grow" />

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#334155]/40 pt-4 bg-[#0F172A] sticky bottom-0 z-20">
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleMarkAndNext}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-3 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 active:scale-95 border border-[#F59E0B]/50 text-[#F59E0B] rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer outline-none text-center"
              >
                MARK & NEXT
              </button>
              <button
                onClick={handleClearResponse}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-3 border border-[#334155]/60 text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E293B]/40 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer outline-none text-center"
              >
                CLEAR RESPONSE
              </button>
            </div>
            
            <button
              onClick={handleSaveAndNext}
              className="w-full sm:w-auto px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40 cursor-pointer outline-none text-center"
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
        timeLeft={timeLeftRef.current}
        attemptedCount={attemptedCount}
        unattemptedCount={unattemptedCount}
        markedCount={markedCount}
        isSubmitting={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setSubmitDialogOpen(false)}
      />
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ActiveTestContent />
    </Suspense>
  );
}
