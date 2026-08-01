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
      <div className="relative w-full max-w-md bg-surface-custom border border-[#334155] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          {/* Circular Badge */}
          <div className="w-12 h-12 bg-primary-custom/10 text-primary-custom border border-primary-custom/20 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
            ⚔️
          </div>
          <h2 className="text-xl font-extrabold text-text-primary-custom">Cadet Portal Registration</h2>
          <p className="text-xs text-text-secondary-custom/60 leading-relaxed">
            Enter your details to track attempts and compete on the leaderboard.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-background-custom p-1 rounded-xl border border-[#334155]/40 select-none">
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-colors outline-none cursor-pointer ${
              activeTab === 'register' 
                ? 'bg-primary-custom text-white shadow-sm' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
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
                ? 'bg-primary-custom text-white shadow-sm' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
            }`}
          >
            Sign In (PIN)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-danger-custom/10 border border-danger-custom/20 rounded-xl text-xs text-danger-custom font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary-custom uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name (e.g. Karan Johar)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background-custom border border-[#334155]/60 rounded-xl text-text-primary-custom placeholder-text-secondary-custom/30 text-sm focus:outline-none focus:border-primary-custom transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary-custom uppercase tracking-wider block">
                  Cadet Number / Roll ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Cadet Code (e.g. C-1095)"
                  value={cadetNumber}
                  onChange={(e) => setCadetNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background-custom border border-[#334155]/60 rounded-xl text-text-primary-custom placeholder-text-secondary-custom/30 text-sm focus:outline-none focus:border-primary-custom transition-colors"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary-custom uppercase tracking-wider block">
              4-Digit PIN Code
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 bg-background-custom border border-[#334155]/60 rounded-xl text-text-primary-custom placeholder-text-secondary-custom/30 text-center tracking-widest font-mono text-base focus:outline-none focus:border-primary-custom transition-colors"
            />
            <span className="text-[10px] text-text-secondary-custom/40 block text-right mt-1 font-medium">
              Numeric PIN code to verify session.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-custom hover:bg-primary-custom/90 text-white rounded-xl text-sm font-bold tracking-wide shadow-md shadow-primary-custom/10 transition-colors cursor-pointer outline-none flex items-center justify-center"
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
