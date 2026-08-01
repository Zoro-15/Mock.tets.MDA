'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test, Attempt } from '../../lib/types';
import { getTests, getRecentAttempts } from '../../lib/db';
import ToggleTabs from '../../components/ToggleTabs';
import TestCard from '../../components/TestCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function FullMockTestsPage() {
  const [activeTab, setActiveTab] = useState<'math' | 'gat'>('math');
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tests
    const all = getTests();
    const mocks = all.filter(t => t.category === 'full_mock');
    setTests(mocks);

    // Load attempt states
    const recent = getRecentAttempts();
    const attemptsMap: Record<string, Attempt> = {};
    recent.forEach((att) => {
      if (!attemptsMap[att.testId]) {
        attemptsMap[att.testId] = att;
      } else {
        const existing = attemptsMap[att.testId];
        if (existing.completed && !att.completed) {
          attemptsMap[att.testId] = att;
        }
      }
    });
    setAttempts(attemptsMap);
    setLoading(false);
  }, []);

  const filteredTests = tests.filter(t => t.subCategory === activeTab);

  const getTestStatus = (testId: string) => {
    const att = attempts[testId];
    if (!att) return { status: 'not_started' as const };
    return {
      status: (att.completed ? 'completed' : 'paused') as 'not_started' | 'paused' | 'completed',
      attemptId: att.id
    };
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-[#1E293B]/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#CBD5E1] hover:text-[#F8FAFC] p-1.5 bg-[#0F172A]/40 rounded-lg border border-[#334155]/60">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="font-extrabold text-lg text-[#F8FAFC]">Full Mock Tests</h1>
            <p className="text-[10px] text-[#CBD5E1]/60 font-bold uppercase tracking-wider">Full Syllabus NDA Simulations</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Toggle tabs */}
        <ToggleTabs
          tabs={[
            { id: 'math', label: 'Mathematics', count: 8 },
            { id: 'gat', label: 'General Ability Test (GAT)', count: 8 }
          ]}
          activeTabId={activeTab}
          onChange={(id) => setActiveTab(id as 'math' | 'gat')}
        />

        {/* Mock Cards List */}
        {loading ? (
          <SkeletonLoader />
        ) : filteredTests.length > 0 ? (
          <div className="space-y-4">
            {filteredTests.map((test) => {
              const { status, attemptId } = getTestStatus(test.id);
              return (
                <TestCard
                  key={test.id}
                  test={test}
                  status={status}
                  attemptId={attemptId}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState title="No Mocks Found" message="Could not fetch full mocks. Please check back later." />
        )}

      </main>
    </div>
  );
}
