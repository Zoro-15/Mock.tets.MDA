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
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'syncing' | 'error'>('saved');
  const [showCelebration, setShowCelebration] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Auto-save helper
  const saveProgress = useCallback((
    updatedResponses: Record<string, QuestionResponse>,
    updatedTimeLeft: number,
    updatedIdx: number
  ) => {
    if (!attemptId) return;
    setSyncStatus('syncing');
    syncAttemptProgress(attemptId, updatedResponses, updatedTimeLeft, updatedIdx)
      .then(() => setSyncStatus('saved'))
      .catch(() => setSyncStatus('error'));
  }, [attemptId]);

  // Submit helper
  const handleFinalSubmit = useCallback(async () => {
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitDialogOpen(false);
    setShowCelebration(true);
    
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
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        zIndex: 9999
      });

      setTimeout(() => {
        router.push(`/analysis?attemptId=${attemptId}`);
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      setShowCelebration(false);
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

    const isAlreadySelected = currentResp.selectedOptionIndex === optIdx;

    const updated = {
      ...responses,
      [qId]: {
        ...currentResp,
        selectedOptionIndex: isAlreadySelected ? null : optIdx,
        status: isAlreadySelected
          ? (currentResp.status === 'marked-attempted' ? 'marked' as const : 'unattempted' as const)
          : ((currentResp.status === 'marked' || currentResp.status === 'marked-attempted')
            ? 'marked-attempted' as const
            : 'attempted' as const)
      }
    };
    
    setResponses(updated);
    saveProgress(updated, timeLeftRef.current, currentIndex);
  }, [activeQuestion, responses, currentIndex, saveProgress]);

  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevIdx = currentIndex - 1;
    setSlideDirection(-1);
    
    const updatedResponses = { ...responses };
    if (activeQuestion) {
      const qId = activeQuestion.id;
      updatedResponses[qId] = {
        ...updatedResponses[qId],
        timeSpent: timeSpentRef.current[qId] || 0
      };
    }

    setResponses(updatedResponses);
    setCurrentIndex(prevIdx);
    saveProgress(updatedResponses, timeLeftRef.current, prevIdx);
  }, [activeQuestion, responses, currentIndex, saveProgress]);

  const handleSaveAndNext = useCallback(() => {
    if (!activeQuestion) return;
    const nextIdx = currentIndex + 1;
    setSlideDirection(1);
    
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
    setSlideDirection(1);
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
    setSlideDirection(idx > currentIndex ? 1 : -1);
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
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        handleSaveAndNext();
      } else if (key === 'ARROWUP') {
        e.preventDefault();
        handleMarkAndNext();
      } else if (key === 'ARROWLEFT') {
        e.preventDefault();
        handlePrevious();
      } else if (key === 'C') {
        e.preventDefault();
        if (activeQuestion) {
          const sel = responses[activeQuestion.id]?.selectedOptionIndex;
          if (sel !== null && sel !== undefined) {
            selectOption(sel);
          }
        }
      } else if (key === 'P') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, responses, activeQuestion, selectOption, handleSaveAndNext, handleMarkAndNext]);

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
    <div className="min-h-screen bg-background-custom text-text-primary-custom flex flex-col justify-between overflow-x-hidden w-full max-w-full box-border select-none">
      
      {/* Top Navbar */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/95 sticky top-0 z-40 shadow-md w-full">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary-custom transition-all duration-500 rounded-r-full" style={{ width: `${(attemptedCount / questions.length) * 100}%` }} />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0 max-w-[50%] sm:max-w-[65%]">
            <button 
              onClick={handlePause}
              className="text-text-secondary-custom hover:text-text-primary-custom p-1.5 hover:bg-background-custom/40 rounded-lg cursor-pointer transition-colors shrink-0"
              title="Pause test"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            </button>
            <h1 className="font-bold text-xs sm:text-sm md:text-base text-text-primary-custom truncate min-w-0" title={test.title}>
              {test.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sync Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2 bg-surface-custom border border-[#334155]/60 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-text-secondary-custom">
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'saved' ? 'bg-success-custom' : syncStatus === 'syncing' ? 'bg-warning-custom animate-pulse' : 'bg-danger-custom'}`}></span>
              {syncStatus}
            </div>

            {/* Zen Mode Toggle */}
            <button onClick={() => setIsZenMode(!isZenMode)} className="hidden md:flex p-2 bg-surface-custom hover:bg-background-custom border border-[#334155]/60 rounded-lg text-text-secondary-custom transition-colors" title="Zen Mode">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
            </button>

            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreen} className="hidden sm:flex p-2 bg-surface-custom hover:bg-background-custom border border-[#334155]/60 rounded-lg text-text-secondary-custom transition-colors" title="Toggle Fullscreen">
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
              )}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Timer component */}
            <Timer initialTimeLeft={initialTime} onTick={handleTick} isPaused={loading || !attempt || attempt.completed || submitDialogOpen || showCelebration} />

            {/* Palette toggle button */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="p-2 bg-primary-custom hover:bg-primary-custom/90 text-white rounded-lg cursor-pointer md:hidden shadow-sm transition-colors"
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
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 flex flex-col md:flex-row gap-6 pb-24 md:pb-6 overflow-x-hidden">
        
        {/* Left Side: Question Panel */}
        <div className={`flex-1 flex flex-col justify-between space-y-6 min-w-0 ${isZenMode ? 'max-w-4xl mx-auto' : ''}`}>
          <AnimatePresence mode="wait" custom={slideDirection}>
            {activeQuestion ? (
              <motion.div 
                key={activeQuestion.id}
                custom={slideDirection}
                initial={{ x: slideDirection * 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection * -40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="space-y-6"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState title="End of Test" message="You have navigated past all questions. Open palette to submit." />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer to push buttons down on desktop */}
          <div className="hidden md:block flex-grow" />

          {/* Desktop & Tablet Action Bar (contained inside the question column) */}
          <div className="hidden md:flex flex-col gap-3 border-t border-[#334155]/40 pt-4 bg-background-custom sticky bottom-0 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  title="Shortcut: Left Arrow (←)"
                  className={`px-5 py-2.5 border border-[#334155]/60 text-text-primary-custom rounded-xl font-bold text-sm tracking-wide transition-all outline-none text-center ${
                    currentIndex === 0 
                      ? 'opacity-40 cursor-not-allowed bg-surface-custom/20' 
                      : 'hover:bg-surface-custom/60 active:scale-95 cursor-pointer'
                  }`}
                >
                  PREVIOUS
                </button>
                <button
                  onClick={handleMarkAndNext}
                  title="Shortcut: Up Arrow (↑)"
                  className="px-5 py-2.5 bg-warning-custom/10 hover:bg-warning-custom/20 active:scale-95 border border-warning-custom/50 text-warning-custom rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer outline-none text-center"
                >
                  MARKS & NEXT
                </button>
              </div>
              
              <button
                onClick={handleSaveAndNext}
                title="Shortcut: Right Arrow (→)"
                className="px-6 py-2.5 bg-primary-custom hover:bg-[#2563EB] active:scale-95 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-primary-custom/20 hover:shadow-primary-custom/40 cursor-pointer outline-none text-center"
              >
                NEXT
              </button>
            </div>
            
            {/* Keyboard Shortcuts Legend */}
            <div className="flex justify-center items-center gap-4 text-[11px] text-text-secondary-custom/60 font-mono pb-1">
              <span title="Select options A to D"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">1-4</kbd> Option</span>
              <span title="Previous Question"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">←</kbd> Prev</span>
              <span title="Save & Next"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">→</kbd> Next</span>
              <span title="Mark for Review"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">↑</kbd> Mark</span>
              <span title="Clear Response"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">C</kbd> Clear</span>
              <span title="Toggle Palette"><kbd className="bg-surface-custom border border-[#334155]/60 rounded px-1.5 py-0.5 shadow-sm">P</kbd> Palette</span>
            </div>
          </div>
        </div>

        {/* Right Side: Palette Panel (pinned on desktop, drawer on mobile) */}
        {!isZenMode && (
          <div className="hidden md:block w-80 shrink-0">
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
        )}
      </div>

      {/* Mobile / Android Fixed Bottom Action Bar (fixed single-line layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-custom/95 border-t border-[#334155]/60 px-2 py-2 shadow-2xl">
        <div className="flex flex-row items-center justify-between gap-1.5 w-full">
          {/* PREVIOUS button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex-1 px-2 py-2.5 border border-[#334155]/60 text-text-primary-custom rounded-xl font-bold text-[11px] tracking-wide transition-all outline-none text-center truncate ${
              currentIndex === 0 
                ? 'opacity-40 cursor-not-allowed bg-surface-custom/20' 
                : 'hover:bg-surface-custom/60 active:scale-95 cursor-pointer'
            }`}
          >
            PREVIOUS
          </button>

          {/* MARKS & NEXT button */}
          <button
            onClick={handleMarkAndNext}
            className="flex-1 px-2 py-2.5 bg-warning-custom/10 hover:bg-warning-custom/20 active:scale-95 border border-warning-custom/50 text-warning-custom rounded-xl font-bold text-[11px] tracking-wide transition-all cursor-pointer outline-none text-center truncate"
          >
            MARKS & NEXT
          </button>

          {/* NEXT button */}
          <button
            onClick={handleSaveAndNext}
            className="flex-1 px-2 py-2.5 bg-primary-custom hover:bg-[#2563EB] active:scale-95 text-white rounded-xl font-bold text-[11px] tracking-wide transition-all shadow-md shadow-primary-custom/20 hover:shadow-primary-custom/40 cursor-pointer outline-none text-center truncate"
          >
            NEXT
          </button>
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

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-custom/95 backdrop-blur-md"
          >
            <LoadingSpinner />
            <h2 className="mt-8 text-xl font-bold text-text-primary-custom animate-pulse tracking-wide">
              Analyzing your performance...
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
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
