import React, { useState } from 'react';
import { Question, QuestionResponse } from '../lib/types';

interface QuestionPaletteProps {
  questions: Question[];
  responses: Record<string, QuestionResponse>;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  onSubmitClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionPalette({
  questions,
  responses,
  currentIndex,
  onSelectIndex,
  onSubmitClick,
  isOpen,
  onClose
}: QuestionPaletteProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const groupedQuestions = React.useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      const sec = q.section || 'Questions';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push({ q, idx });
      return acc;
    }, {} as Record<string, { q: Question; idx: number }[]>);
  }, [questions]);

  // Helpers to count states
  const list = Object.values(responses);
  const attemptedCount = list.filter(r => r.selectedOptionIndex !== null && r.status !== 'marked').length;
  const unattemptedCount = list.filter(r => r.selectedOptionIndex === null && r.status === 'unattempted').length;
  const markedCount = list.filter(r => r.status === 'marked' || r.status === 'marked-attempted').length;
  const unseenCount = questions.length - list.length + list.filter(r => r.status === 'unseen').length;

  const getQuestionButtonStyles = (q: Question, idx: number) => {
    const resp = responses[q.id];
    const isCurrent = idx === currentIndex;
    
    let base = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative transition-all border cursor-pointer outline-none ";
    
    if (isCurrent) {
      base += " ring-2 ring-offset-2 ring-offset-background-custom ring-primary-custom ";
    }

    if (!resp) {
      return base + "bg-surface-custom border-[#334155] text-text-secondary-custom";
    }

    if (resp.status === 'marked' || resp.status === 'marked-attempted') {
      // Marked for review (represented by amber/red background and a star indicator)
      return base + "bg-warning-custom/20 border-warning-custom text-warning-custom";
    } else if (resp.selectedOptionIndex !== null) {
      // Answered
      return base + "bg-primary-custom border-primary-custom text-white";
    } else if (resp.status === 'unattempted') {
      // Visited but not answered
      return base + "bg-[#334155] border-[#475569] text-text-secondary-custom";
    } else {
      // Unseen
      return base + "bg-surface-custom/40 border-[#334155]/60 text-text-secondary-custom/60";
    }
  };

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-background-custom md:bg-surface-custom border-l border-[#334155] z-50 transform transition-transform duration-300 flex flex-col md:static md:translate-x-0 md:z-0 md:h-[calc(100vh-140px)] md:rounded-2xl shadow-2xl md:shadow-none ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        {/* Mobile Header (Close button & title) */}
        <div className="flex justify-between items-center md:hidden px-5 py-4 border-b border-[#334155]/60 shrink-0 bg-surface-custom/30">
          <span className="text-sm font-bold text-text-primary-custom">Question Palette</span>
          <button 
            onClick={onClose} 
            className="p-1.5 text-text-secondary-custom hover:text-text-primary-custom bg-surface-custom/50 rounded-lg border border-[#334155]/60 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle Grid/List Header */}
        <div className="flex border-b border-[#334155] text-xs font-semibold select-none shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-3 text-center transition-colors outline-none cursor-pointer ${
              viewMode === 'grid' 
                ? 'text-primary-custom border-b-2 border-primary-custom font-bold' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-3 text-center transition-colors outline-none cursor-pointer ${
              viewMode === 'list' 
                ? 'text-primary-custom border-b-2 border-primary-custom font-bold' 
                : 'text-text-secondary-custom hover:text-text-primary-custom'
            }`}
          >
            List View
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Legends */}
          <div className="bg-background-custom/50 border border-[#334155]/30 rounded-xl p-3 space-y-2.5">
            <h4 className="text-xs font-bold text-text-secondary-custom/80 uppercase tracking-wider mb-2">Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-primary-custom flex-shrink-0" />
                <span className="text-text-secondary-custom">Attempted ({attemptedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#334155] border border-[#475569] flex-shrink-0" />
                <span className="text-text-secondary-custom">Unattempted ({unattemptedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-warning-custom/20 border border-warning-custom flex-shrink-0" />
                <span className="text-text-secondary-custom">Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-surface-custom/40 border border-[#334155]/60 flex-shrink-0" />
                <span className="text-text-secondary-custom">Unseen ({unseenCount})</span>
              </div>
            </div>
          </div>

          {/* Question List/Grid Content */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary-custom/80 uppercase tracking-wider mb-3">Questions</h4>
            
            {viewMode === 'grid' ? (
              <div className="space-y-6">
                {Object.entries(groupedQuestions).map(([sectionName, sectionQuestions]) => (
                  <div key={sectionName}>
                    {sectionName !== 'Questions' && (
                      <h5 className="text-[11px] font-bold text-primary-custom mb-3 border-b border-primary-custom/30 pb-1">{sectionName}</h5>
                    )}
                    <div className="grid grid-cols-5 gap-3">
                      {sectionQuestions.map(({ q, idx }) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            onSelectIndex(idx);
                            // Close drawer on mobile
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={getQuestionButtonStyles(q, idx)}
                        >
                          <span>{idx + 1}</span>
                          {/* Add mini star for marked items */}
                          {(responses[q.id]?.status === 'marked' || responses[q.id]?.status === 'marked-attempted') && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-warning-custom rounded-full border border-surface-custom" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedQuestions).map(([sectionName, sectionQuestions]) => (
                  <div key={sectionName} className="space-y-2">
                    {sectionName !== 'Questions' && (
                      <h5 className="text-[11px] font-bold text-primary-custom mb-2 border-b border-primary-custom/30 pb-1">{sectionName}</h5>
                    )}
                    {sectionQuestions.map(({ q, idx }) => {
                      const resp = responses[q.id];
                      const isCurrent = idx === currentIndex;
                      const isAnswered = resp?.selectedOptionIndex !== null;
                      const isMarked = resp?.status === 'marked' || resp?.status === 'marked-attempted';
                      
                      let badgeText = "Unseen";
                      let badgeClass = "bg-surface-custom/40 text-text-secondary-custom/50";
                      
                      if (isMarked) {
                        badgeText = isAnswered ? "Answered & Marked" : "Marked";
                        badgeClass = "bg-warning-custom/10 text-warning-custom border border-warning-custom/20";
                      } else if (isAnswered) {
                        badgeText = "Answered";
                        badgeClass = "bg-primary-custom/10 text-primary-custom border border-primary-custom/20";
                      } else if (resp?.status === 'unattempted') {
                        badgeText = "Unattempted";
                        badgeClass = "bg-[#334155]/50 text-text-secondary-custom";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            onSelectIndex(idx);
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-semibold cursor-pointer outline-none transition-colors ${
                            isCurrent 
                              ? 'border-primary-custom bg-primary-custom/5' 
                              : 'border-[#334155]/40 hover:bg-surface-custom/50'
                          }`}
                        >
                          <span className="text-text-primary-custom">Question {idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                            {badgeText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="p-4 border-t border-[#334155] bg-surface-custom/90 flex-shrink-0">
          <button
            onClick={onSubmitClick}
            className="w-full py-3 bg-danger-custom hover:bg-danger-custom/90 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-colors cursor-pointer outline-none"
          >
            SUBMIT TEST
          </button>
        </div>
      </div>
    </>
  );
}
