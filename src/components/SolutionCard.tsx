import React from 'react';
import { Question, QuestionResponse } from '../lib/types';
import LatexRenderer from './LatexRenderer';
import OptionCard from './OptionCard';

interface SolutionCardProps {
  question: Question;
  response: QuestionResponse | undefined;
  questionNumber: number;
}

export default function SolutionCard({ question, response, questionNumber }: SolutionCardProps) {
  const selectedIdx = response?.selectedOptionIndex ?? null;
  const correctIdx = question.correctOptionIndex;
  
  const isAttempted = selectedIdx !== null;
  const isCorrect = isAttempted && selectedIdx === correctIdx;
  const isWrong = isAttempted && selectedIdx !== correctIdx;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  // Status badge details
  let badgeText = "Unattempted";
  let badgeClass = "bg-[#334155]/40 text-text-secondary-custom border border-[#334155]/60";

  if (isCorrect) {
    badgeText = "Correct";
    badgeClass = "bg-success-custom/10 text-success-custom border border-success-custom/30";
  } else if (isWrong) {
    badgeText = "Incorrect";
    badgeClass = "bg-danger-custom/10 text-danger-custom border border-danger-custom/30";
  }

  // Get alphabetical labels
  const getLabel = (idx: number) => ['A', 'B', 'C', 'D'][idx];

  return (
    <div className="bg-surface-custom border border-[#334155]/60 rounded-2xl p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#334155]/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary-custom/10 text-primary-custom border border-primary-custom/20 rounded-lg text-sm font-bold font-mono">
            Question {questionNumber}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary-custom bg-background-custom px-2.5 py-1 rounded-md font-mono">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary-custom">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Time Spent: {formatTime(response?.timeSpent ?? 0)}</span>
        </div>
      </div>

      {/* Question Body */}
      <div className="space-y-4 text-base leading-relaxed text-text-primary-custom">
        {question.comprehension && (
          <div className="bg-warning-custom/10 border-l-4 border-warning-custom rounded-r-xl p-4 text-text-secondary-custom text-sm leading-relaxed mb-4">
            <LatexRenderer text={question.comprehension} />
          </div>
        )}
        <LatexRenderer text={question.questionText} />

        {/* Assertion-Reason */}
        {question.type === 'assertion-reason' && question.assertionText && question.reasonText && (
          <div className="pl-4 border-l-2 border-primary-custom py-1 bg-background-custom/30 rounded-r-lg space-y-2 mt-3 p-3">
            <div className="text-sm">
              <strong className="text-primary-custom">Assertion (A):</strong>{' '}
              <LatexRenderer text={question.assertionText} />
            </div>
            <div className="text-sm">
              <strong className="text-primary-custom">Reason (R):</strong>{' '}
              <LatexRenderer text={question.reasonText} />
            </div>
          </div>
        )}

        {/* Tables */}
        {question.type === 'table' && question.tableData && question.tableData.length > 0 && (
          <div className="my-4 overflow-x-auto border border-[#334155]/60 rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-background-custom border-b border-[#334155]/60">
                  {question.tableData[0].map((header, idx) => (
                    <th key={idx} className="p-3 font-semibold text-text-primary-custom">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.tableData.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-[#334155]/40 hover:bg-surface-custom/50 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 text-text-secondary-custom">
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

      {/* Answer Options Checklist Grid */}
      <div className="grid grid-cols-1 gap-3 mt-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isOptCorrect = idx === correctIdx;
          const isOptWrong = isSelected && !isOptCorrect;

          return (
            <OptionCard
              key={idx}
              label={getLabel(idx)}
              content={opt}
              isSelected={isSelected}
              isCorrect={isOptCorrect}
              isWrong={isOptWrong}
              disabled={true}
            />
          );
        })}
      </div>

      {/* Detailed Explanation Section */}
      <div className="bg-background-custom/70 border border-[#334155]/40 rounded-xl p-5 mt-5 space-y-3">
        <h4 className="text-sm font-bold text-primary-custom flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.14 4.084A3.75 3.75 0 0 0 12 18Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22.04 12.584a12.006 12.006 0 0 1-2.131 7.963 8.25 8.25 0 0 0-4.886-4.887 11.968 11.968 0 0 0-4.084-2.14 8.25 8.25 0 0 0-4.887-4.886 12.006 12.006 0 0 1 7.964-2.132A11.97 11.97 0 0 0 12 1.96a12.006 12.006 0 0 1 10.04 10.624Z" />
          </svg>
          Step-by-Step Explanation
        </h4>
        <div className="text-sm text-text-secondary-custom leading-relaxed">
          <LatexRenderer text={question.explanation} />
        </div>
      </div>
    </div>
  );
}
