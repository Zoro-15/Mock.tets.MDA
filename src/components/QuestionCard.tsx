import React from 'react';
import { Question } from '../lib/types';
import LatexRenderer from './LatexRenderer';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  timeSpent: number; // in seconds
  positiveMarks: number;
  negativeMarks: number;
}

export default function QuestionCard({ 
  question, 
  questionNumber, 
  timeSpent, 
  positiveMarks, 
  negativeMarks 
}: QuestionCardProps) {
  
  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#1E293B]/70 border border-[#334155]/60 rounded-2xl p-6 space-y-5">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#334155]/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-lg text-sm font-bold font-mono">
            Q. {questionNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1] bg-[#0F172A] px-2.5 py-1 rounded-md font-mono">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Time: {formatTimeSpent(timeSpent)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-2 py-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
            +{positiveMarks.toFixed(1)}
          </div>
          <div className="px-2 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
            -{negativeMarks.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Question Text Area */}
      <div className="space-y-4 text-[#F8FAFC] text-base leading-relaxed">
        {question.comprehension && (
          <div className="bg-[#F59E0B]/10 border-l-4 border-[#F59E0B] rounded-r-xl p-4 text-[#CBD5E1] text-sm leading-relaxed mb-4">
            <LatexRenderer text={question.comprehension} />
          </div>
        )}
        <div>
          <LatexRenderer text={question.questionText} />
        </div>

        {/* Render Assertion-Reason details */}
        {question.type === 'assertion-reason' && question.assertionText && question.reasonText && (
          <div className="pl-4 border-l-2 border-[#3B82F6] py-1 bg-[#1E293B]/40 rounded-r-lg space-y-2 mt-3 p-3">
            <div className="text-sm">
              <strong className="text-[#3B82F6] font-bold">Assertion (A):</strong>{' '}
              <LatexRenderer text={question.assertionText} />
            </div>
            <div className="text-sm">
              <strong className="text-[#3B82F6] font-bold">Reason (R):</strong>{' '}
              <LatexRenderer text={question.reasonText} />
            </div>
          </div>
        )}

        {/* Render Table details */}
        {question.type === 'table' && question.tableData && question.tableData.length > 0 && (
          <div className="my-4 overflow-x-auto border border-[#334155]/60 rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0F172A] border-b border-[#334155]/60">
                  {question.tableData[0].map((header, idx) => (
                    <th key={idx} className="p-3 font-semibold text-[#F8FAFC]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.tableData.slice(1).map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className="border-b border-[#334155]/40 hover:bg-[#1E293B]/50 transition-colors"
                  >
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 text-[#CBD5E1]">
                        <LatexRenderer text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
