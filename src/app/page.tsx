'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Attempt, Test, User, UniversalLeaderboardEntry } from '../lib/types';
import { getTestById, getCurrentUser, setCurrentUser, fetchRecentAttemptsFromSupabase, getUniversalLeaderboard } from '../lib/db';
import ContinueLearningCard from '../components/ContinueLearningCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RegistrationModal from '../components/RegistrationModal';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const [currentUser, setUser] = useState<User | null>(null);
  const [unfinishedAttempt, setUnfinishedAttempt] = useState<Attempt | null>(null);
  const [associatedTest, setAssociatedTest] = useState<Test | null>(null);
  const [leaderboard, setLeaderboard] = useState<UniversalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessionAndAttempts = async (user: User) => {
    setLoading(true);
    try {
      const recent = await fetchRecentAttemptsFromSupabase(user.id);
      const incomplete = recent.find(att => !att.completed);
      
      if (incomplete) {
        setUnfinishedAttempt(incomplete);
        const test = getTestById(incomplete.testId);
        if (test) setAssociatedTest(test);
      } else {
        setUnfinishedAttempt(null);
        setAssociatedTest(null);
      }
    } catch (e) {
      console.error('Error loading session attempts:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const user = getCurrentUser();
      setUser(user);
      if (user) {
        await loadSessionAndAttempts(user);
      } else {
        setLoading(false);
      }
      
      try {
        const board = await getUniversalLeaderboard();
        setLeaderboard(board);
      } catch (err) {
        console.error('Failed to load universal leaderboard:', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleAuthSuccess = () => {
    const user = getCurrentUser();
    setUser(user);
    if (user) {
      loadSessionAndAttempts(user);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setUnfinishedAttempt(null);
    setAssociatedTest(null);
  };

  return (
    <div className="min-h-screen bg-background-custom text-text-primary-custom flex flex-col justify-between">
      {/* Registration / Login Modal Overlay */}
      {!currentUser && <RegistrationModal onSuccess={handleAuthSuccess} />}

      {/* Header */}
      <header className="border-b border-[#334155]/60 bg-surface-custom/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 select-none pointer-events-none flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full text-text-primary-custom">
                <defs>
                  <clipPath id="logoCircleClip">
                    <circle cx="50" cy="50" r="40" />
                  </clipPath>
                </defs>
                {/* Circle outline */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" />
                
                {/* Inner parts clipped */}
                <g clipPath="url(#logoCircleClip)">
                  {/* Left boundary line */}
                  <line x1="38" y1="0" x2="38" y2="100" stroke="currentColor" strokeWidth="6" />
                  {/* Right boundary line */}
                  <line x1="62" y1="0" x2="62" y2="100" stroke="currentColor" strokeWidth="6" />
                  
                  {/* Center lines */}
                  <line x1="45" y1="0" x2="45" y2="100" stroke="currentColor" strokeWidth="3.2" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="3.2" />
                  <line x1="55" y1="0" x2="55" y2="100" stroke="currentColor" strokeWidth="3.2" />
                </g>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg text-text-primary-custom tracking-tight block leading-tight">NDA Mock</span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-text-secondary-custom">
            <Link href="/" className="text-primary-custom transition-colors">Home</Link>
            <Link href="/previous-year" className="hover:text-text-primary-custom transition-colors">PY Papers</Link>
            <Link href="/maths-pack" className="hover:text-text-primary-custom transition-colors">Math Pack</Link>
            <Link href="/full-mocks" className="hover:text-text-primary-custom transition-colors">Full Mocks</Link>
          </nav>

          {/* Profile & Logout Panel */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <div className="text-text-secondary-custom hidden xs:block text-right">
                    <div className="text-text-primary-custom font-bold">{currentUser.name}</div>
                    <div className="text-[10px] text-text-secondary-custom/60 font-mono">{currentUser.cadetNumber}</div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#dfdcd4] border border-[#c7c4b8] flex items-center justify-center font-bold text-[#111827] shadow-sm select-none">
                    {currentUser.name[0].toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-danger-custom hover:text-danger-custom/80 hover:bg-danger-custom/10 border border-transparent hover:border-danger-custom/30 px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold outline-none"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 pt-8 pb-4 space-y-10 flex-grow flex-1">
        
        {/* Welcome Section */}
        <section className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary-custom tracking-tight">
            Welcome back, {currentUser ? currentUser.name : 'Aspirant'}!
          </h1>
        </section>

        {/* Continue Learning card */}
        {currentUser && (
          <section className="space-y-4">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <ContinueLearningCard unfinishedAttempt={unfinishedAttempt} test={associatedTest} />
            )}
          </section>
        )}

        {/* Universal Leaderboard Section */}
        {leaderboard.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary-custom flex items-center gap-2">
              <span className="text-primary-custom">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
              </span>
              Top Aspirants
            </h2>
            <div className="bg-surface-custom border border-[#334155]/40 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary-custom uppercase bg-black/20">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-semibold w-16 text-center">Rank</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Aspirant</th>
                      <th scope="col" className="px-6 py-3 font-semibold text-center">Tests Attempted (&gt;90m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/30">
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.rank} 
                        className={`hover:bg-[#334155]/10 transition-colors ${entry.isCurrentUser ? 'bg-primary-custom/5 border-l-2 border-l-primary-custom' : ''}`}
                      >
                        <td className="px-6 py-4 font-bold text-center">
                          {entry.rank === 1 ? <span className="text-yellow-500">🏆 1</span> : 
                           entry.rank === 2 ? <span className="text-gray-400">🥈 2</span> : 
                           entry.rank === 3 ? <span className="text-amber-700">🥉 3</span> : entry.rank}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-bold ${entry.isCurrentUser ? 'text-primary-custom' : 'text-text-primary-custom'}`}>
                            {entry.name} {entry.isCurrentUser && <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-primary-custom/20 text-primary-custom">YOU</span>}
                          </div>
                          <div className="text-xs text-text-secondary-custom/70 font-mono mt-0.5">{entry.cadetNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-text-primary-custom">
                          {entry.testsAttempted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Main Categories Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary-custom">Mock Test Library</h2>
          
          <div className="flex flex-col gap-4">
            
            {/* Previous Year Papers */}
            <Link 
              href="/previous-year"
              className="group p-5 bg-surface-custom border border-[#334155]/40 rounded-xl hover:border-primary-custom/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-custom/10 rounded-xl flex items-center justify-center text-primary-custom group-hover:bg-primary-custom group-hover:text-white transition-colors duration-300 shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary-custom">Previous Year Papers</h3>
                  <p className="text-xs text-text-secondary-custom">
                    PYQ From 2015-2025 [ 21+21 ]
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 text-primary-custom font-semibold text-xs pt-3 sm:pt-0 border-t sm:border-t-0 border-[#334155]/20 mt-3 sm:mt-0 shrink-0">
                <span>42 Papers Available</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* Mathematics Super Pack */}
            <Link 
              href="/maths-pack"
              className="group p-5 bg-surface-custom border border-[#334155]/40 rounded-xl hover:border-primary-custom/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-custom/10 rounded-xl flex items-center justify-center text-primary-custom group-hover:bg-primary-custom group-hover:text-white transition-colors duration-300 shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-3.675v3.675m-3-3v3m3-10.75a9 9 0 1 1-9 9 9 9 0 0 1 9-9Z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary-custom">Mathematics Super Pack</h3>
                  <p className="text-xs text-text-secondary-custom">
                    31 Chapter Wise + 5 Subject Test
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 text-primary-custom font-semibold text-xs pt-3 sm:pt-0 border-t sm:border-t-0 border-[#334155]/20 mt-3 sm:mt-0 shrink-0">
                <span>36 Chapter & Subject Tests</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* Full Mock Tests */}
            <Link 
              href="/full-mocks"
              className="group p-5 bg-surface-custom border border-[#334155]/40 rounded-xl hover:border-primary-custom/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-custom/10 rounded-xl flex items-center justify-center text-primary-custom group-hover:bg-primary-custom group-hover:text-white transition-colors duration-300 shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408 9-9m-9 0 9 9" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary-custom">Full Mock Tests</h3>
                  <p className="text-xs text-text-secondary-custom">
                    Simulation Of a Real Mock Test [ 8+8 ]
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 text-primary-custom font-semibold text-xs pt-3 sm:pt-0 border-t sm:border-t-0 border-[#334155]/20 mt-3 sm:mt-0 shrink-0">
                <span>16 Full Length Mock Tests</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#334155]/40 bg-surface-custom/35 mt-6">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-text-secondary-custom/60">
          &copy; {new Date().getFullYear()} NDA Mock Test Platform. All rights reserved. Designed for NDA aspirants.
        </div>
      </footer>
    </div>
  );
}
