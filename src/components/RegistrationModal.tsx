'use client';

import React, { useState } from 'react';
import { registerUser, loginUser } from '../lib/db';

interface RegistrationModalProps {
  onSuccess: () => void;
}

export default function RegistrationModal({ onSuccess }: RegistrationModalProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [cadetNumber, setCadetNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!studentCode || studentCode.length !== 4 || isNaN(Number(studentCode))) {
      setError('PIN must be exactly 4 digits.');
      setLoading(false);
      return;
    }

    if (activeTab === 'register') {
      if (!name.trim()) {
        setError('Please enter your name.');
        setLoading(false);
        return;
      }
      if (!cadetNumber.trim()) {
        setError('Please enter your Cadet Number.');
        setLoading(false);
        return;
      }

      const res = await registerUser(name.trim(), cadetNumber.trim().toUpperCase(), studentCode);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Registration failed.');
      }
    } else {
      const res = await loginUser(studentCode);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'PIN login failed.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          {/* Circular Badge */}
          <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
            ⚔️
          </div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC]">Cadet Portal Registration</h2>
          <p className="text-xs text-[#CBD5E1]/60 leading-relaxed">
            Enter your details to track attempts and compete on the leaderboard.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0F172A] p-1 rounded-xl border border-[#334155]/40 select-none">
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-colors outline-none cursor-pointer ${
              activeTab === 'register' 
                ? 'bg-[#3B82F6] text-white shadow-sm' 
                : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
            }`}
          >
            Register Cadet
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-colors outline-none cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-[#3B82F6] text-white shadow-sm' 
                : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
            }`}
          >
            Sign In (PIN)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444] font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name (e.g. Karan Johar)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155]/60 rounded-xl text-[#F8FAFC] placeholder-[#CBD5E1]/30 text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider block">
                  Cadet Number / Roll ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Cadet Code (e.g. C-1095)"
                  value={cadetNumber}
                  onChange={(e) => setCadetNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155]/60 rounded-xl text-[#F8FAFC] placeholder-[#CBD5E1]/30 text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider block">
              4-Digit PIN Code
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155]/60 rounded-xl text-[#F8FAFC] placeholder-[#CBD5E1]/30 text-center tracking-widest font-mono text-base focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
            <span className="text-[10px] text-[#CBD5E1]/40 block text-right mt-1 font-medium">
              Numeric PIN code to verify session.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl text-sm font-bold tracking-wide shadow-md shadow-[#3B82F6]/10 transition-colors cursor-pointer outline-none flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : activeTab === 'register' ? (
              'REGISTER & ENTER'
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
