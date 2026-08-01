export interface Question {
  id: string;
  type: 'text' | 'latex' | 'table' | 'assertion-reason';
  questionText: string;
  comprehension?: string; // Used for passage/comprehension questions
  assertionText?: string; // Used for assertion-reason questions
  reasonText?: string;    // Used for assertion-reason questions
  tableData?: string[][]; // Header row + data rows for tables
  options: string[];      // 4 choices
  correctOptionIndex: number;
  explanation: string;
}

export type TestCategory = 'pyp' | 'maths_pack' | 'full_mock';
export type TestSubCategory = 'math' | 'gat' | 'chapter' | 'subject';

export interface Test {
  id: string;
  title: string;
  category: TestCategory;
  subCategory: TestSubCategory;
  questionsCount: number;
  duration: number; // in minutes
  marks: number;
  negativeMarking: number; // raw value to subtract (e.g. 0.83 for Math, 1.33 for GAT)
  syllabus?: string[];
  sourceFileName?: string;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number | null; // null if unattempted
  timeSpent: number;                  // time spent in seconds
  status: 'unseen' | 'unattempted' | 'attempted' | 'marked' | 'marked-attempted';
}

export interface Attempt {
  id: string;
  testId: string;
  responses: Record<string, QuestionResponse>; // key: questionId
  timeLeft: number;                            // in seconds
  currentQuestionIndex: number;
  completed: boolean;
  score: number;
  accuracy: number;       // in percentage
  percentile: number;     // calculated placeholder
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeTaken: number;      // in seconds
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  timeTaken: string;
  isCurrentUser?: boolean;
}

export interface User {
  id: string;
  name: string;
  cadetNumber: string;
  studentCode: string;
}
