import { Test, Attempt, Question, QuestionResponse, LeaderboardEntry } from './types';
import { allTests, generateQuestionsForTest } from './mockData';

// Quotes bank
const MOTIVATIONAL_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Every question solved today brings you one step closer to the Academy.",
  "The National Defence Academy is not just a campus; it is a cradle of leadership.",
  "Service Before Self - Let this motto guide your preparation every single day.",
  "Sweat more in peace, bleed less in war.",
  "Your efforts today will define the prefix 'Lieutenant' or 'Flying Officer' tomorrow.",
  "Courage is not the absence of fear, but the triumph over it.",
  "The Academy doors open only to those who refuse to give up."
];

export function getMotivationalQuote(): string {
  // Return random quote
  if (typeof window === 'undefined') return MOTIVATIONAL_QUOTES[0];
  const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[idx];
}

// Emulate DB calls
export function getTests(): Test[] {
  return allTests;
}

export function getTestById(id: string): Test | undefined {
  return allTests.find(t => t.id === id);
}

export function getQuestions(testId: string): Question[] {
  return generateQuestionsForTest(testId);
}

// Manage attempts via localStorage
const ATTEMPTS_KEY = 'nda_mock_attempts';

function getAllAttempts(): Record<string, Attempt> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading attempts from localStorage', e);
    return {};
  }
}

function saveAttempts(attempts: Record<string, Attempt>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.error('Error writing attempts to localStorage', e);
  }
}

export function createAttempt(testId: string): Attempt | null {
  const test = getTestById(testId);
  if (!test) return null;

  const questions = getQuestions(testId);
  const responses: Record<string, QuestionResponse> = {};

  questions.forEach((q) => {
    responses[q.id] = {
      questionId: q.id,
      selectedOptionIndex: null,
      timeSpent: 0,
      status: 'unseen'
    };
  });

  // Set the first question as visited/unattempted
  if (questions.length > 0) {
    responses[questions[0].id].status = 'unattempted';
  }

  const attemptId = `attempt-${Date.now()}`;
  const attempt: Attempt = {
    id: attemptId,
    testId,
    responses,
    timeLeft: test.duration * 60,
    currentQuestionIndex: 0,
    completed: false,
    score: 0,
    accuracy: 0,
    percentile: 0,
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: questions.length,
    timeTaken: 0,
    startedAt: new Date().toISOString()
  };

  const attempts = getAllAttempts();
  attempts[attemptId] = attempt;
  saveAttempts(attempts);

  return attempt;
}

export function updateAttemptProgress(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number,
  currentQuestionIndex: number
): Attempt | null {
  const attempts = getAllAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  attempt.responses = responses;
  attempt.timeLeft = timeLeft;
  attempt.currentQuestionIndex = currentQuestionIndex;

  attempts[attemptId] = attempt;
  saveAttempts(attempts);
  return attempt;
}

export function getAttempt(attemptId: string): Attempt | null {
  const attempts = getAllAttempts();
  return attempts[attemptId] || null;
}

export function getRecentAttempts(): Attempt[] {
  const attempts = getAllAttempts();
  return Object.values(attempts)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function submitAttempt(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number
): Attempt | null {
  const attempts = getAllAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  const test = getTestById(attempt.testId);
  if (!test) return null;

  const questions = getQuestions(attempt.testId);
  
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let timeTakenSum = 0;

  // Let's compute marks per question
  // Math: 120 Qs, 300 Marks => 2.5 marks/Q. (or 10 Qs, 25 Marks => 2.5)
  // GAT: 150 Qs, 600 Marks => 4.0 marks/Q.
  const marksPerQuestion = test.subCategory === 'gat' ? 4.0 : 2.5;

  questions.forEach((q) => {
    const resp = responses[q.id];
    if (!resp) {
      unattemptedCount++;
      return;
    }

    timeTakenSum += resp.timeSpent;

    if (resp.selectedOptionIndex === null) {
      unattemptedCount++;
    } else if (resp.selectedOptionIndex === q.correctOptionIndex) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // Calculate score with negative markings
  const scoreRaw = (correctCount * marksPerQuestion) - (incorrectCount * test.negativeMarking);
  // Round to 2 decimal places
  const score = Math.round(scoreRaw * 100) / 100;

  const totalAttempted = correctCount + incorrectCount;
  const accuracy = totalAttempted > 0 
    ? Math.round((correctCount / totalAttempted) * 100 * 100) / 100 
    : 0;

  // Calculate simulated percentile
  let percentile = 0;
  if (totalAttempted > 0) {
    const ratio = score / test.marks;
    percentile = 70 + ratio * 28 + (Math.random() * 2 - 1);
    percentile = Math.max(5.5, Math.min(99.9, Math.round(percentile * 100) / 100));
  }

  attempt.responses = responses;
  attempt.timeLeft = timeLeft;
  attempt.completed = true;
  attempt.score = score;
  attempt.accuracy = accuracy;
  attempt.percentile = percentile;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unattemptedCount = unattemptedCount;
  attempt.timeTaken = test.duration * 60 - timeLeft; // Total time spent in seconds
  attempt.completedAt = new Date().toISOString();

  attempts[attemptId] = attempt;
  saveAttempts(attempts);

  return attempt;
}

export function getLeaderboard(testId: string): LeaderboardEntry[] {
  // Generate random leaderboard entries based on test
  const test = getTestById(testId);
  const max = test ? test.marks : 300;

  return [
    { rank: 1, name: "Aditya Singh", score: Math.round(max * 0.92 * 100) / 100, accuracy: 95, timeTaken: "1h 45m" },
    { rank: 2, name: "Vikram Rathore", score: Math.round(max * 0.88 * 100) / 100, accuracy: 92, timeTaken: "1h 50m" },
    { rank: 3, name: "Neha Sharma", score: Math.round(max * 0.85 * 100) / 100, accuracy: 89, timeTaken: "1h 53m" },
    { rank: 4, name: "Rahul Verma", score: Math.round(max * 0.81 * 100) / 100, accuracy: 86, timeTaken: "1h 48m" },
    { rank: 5, name: "Karan Johar", score: Math.round(max * 0.78 * 100) / 100, accuracy: 84, timeTaken: "2h 02m" }
  ];
}
