'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Attempt, Test } from '../lib/types';
import { getRecentAttempts, getTestById } from '../lib/db';
import ContinueLearningCard from '../components/ContinueLearningCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [unfinishedAttempt, setUnfinishedAttempt] = useState<Attempt | null>(null);
  const [associatedTest, setAssociatedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage on mount
    const recent = getRecentAttempts();
    const incomplete = recent.find(att => !att.completed);
    
    if (incomplete) {
      setUnfinishedAttempt(incomplete);
      const test = getTestById(incomplete.testId);
      if (test) setAssociatedTest(test);
    } else {
      setUnfinishedAttempt(null);
      setAssociatedTest(null);
    }
    
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-[#1E293B]/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center font-black text-xl text-white tracking-wider shadow-md shadow-[#3B82F6]/20">
              N
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#F8FAFC] tracking-tight block leading-tight">NDA Mock</span>
              <span className="text-[10px] text-[#CBD5E1]/60 font-bold uppercase tracking-wider block">Test Platform</span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-[#CBD5E1]">
            <Link href="/" className="text-[#3B82F6] transition-colors">Home</Link>
            <Link href="/previous-year" className="hover:text-[#F8FAFC] transition-colors">PY Papers</Link>
            <Link href="/maths-pack" className="hover:text-[#F8FAFC] transition-colors">Math Pack</Link>
            <Link href="/full-mocks" className="hover:text-[#F8FAFC] transition-colors">Full Mocks</Link>
          </nav>

          {/* Profile Placeholder */}
          <div className="flex items-center gap-3 bg-[#0F172A]/40 pl-3 pr-1 py-1 rounded-full border border-[#334155]/60">
            <span className="text-xs font-semibold text-[#CBD5E1] hidden xs:inline">Aspirant</span>
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/50 flex items-center justify-center font-bold text-sm text-[#3B82F6]">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        
        {/* Welcome Section */}
        <section className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Welcome back, Aspirant!
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-xl leading-relaxed">
            Gear up for the National Defence Academy. Consistency is key to clearing the cutoff.
          </p>
        </section>

        {/* Continue Learning card */}
        <section className="bg-[#1E293B]/40 p-4 sm:p-6 border border-[#334155]/40 rounded-2xl">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ContinueLearningCard unfinishedAttempt={unfinishedAttempt} test={associatedTest} />
          )}
        </section>

        {/* Main Categories Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Mock Test Library</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Previous Year Papers */}
            <Link 
              href="/previous-year"
              className="group p-6 bg-[#1E293B] border border-[#334155]/60 rounded-2xl hover:border-[#3B82F6]/50 transition-all hover:-translate-y-1 flex flex-col justify-between h-52 relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Previous Year Papers</h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Practice actual questions from the official NDA exams (2015-2025).
                </p>
              </div>
              <div className="flex items-center justify-between text-[#3B82F6] font-semibold text-sm pt-4 border-t border-[#334155]/40 mt-4">
                <span>42 Papers Available</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* Mathematics Super Pack */}
            <Link 
              href="/maths-pack"
              className="group p-6 bg-[#1E293B] border border-[#334155]/60 rounded-2xl hover:border-[#3B82F6]/50 transition-all hover:-translate-y-1 flex flex-col justify-between h-52 relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-3.675v3.675m-3-3v3m3-10.75a9 9 0 1 1-9 9 9 9 0 0 1 9-9Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Mathematics Super Pack</h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Sharpen mathematical formulas, matrices, derivatives, and vectors.
                </p>
              </div>
              <div className="flex items-center justify-between text-[#3B82F6] font-semibold text-sm pt-4 border-t border-[#334155]/40 mt-4">
                <span>36 Chapter & Subject Tests</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* Full Mock Tests */}
            <Link 
              href="/full-mocks"
              className="group p-6 bg-[#1E293B] border border-[#334155]/60 rounded-2xl hover:border-[#3B82F6]/50 transition-all hover:-translate-y-1 flex flex-col justify-between h-52 relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408 9-9m-9 0 9 9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Full Mock Tests</h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Simulate the actual 2.5-hour NDA paper under realistic exam pressure.
                </p>
              </div>
              <div className="flex items-center justify-between text-[#3B82F6] font-semibold text-sm pt-4 border-t border-[#334155]/40 mt-4">
                <span>16 Full Length Mock Tests</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#334155]/40 bg-[#1E293B]/35 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-[#CBD5E1]/60">
          &copy; {new Date().getFullYear()} NDA Mock Test Platform. All rights reserved. Designed for NDA aspirants.
        </div>
      </footer>
    </div>
  );
}
