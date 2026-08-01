import { Test, Attempt, Question, QuestionResponse, LeaderboardEntry, User } from './types';
import { allTests, generateQuestionsForTest } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const USER_SESSION_KEY = 'nda_mock_user_session';
const ATTEMPTS_KEY = 'nda_mock_attempts';

// ========================================================
// 0. TEST CONFIGURATIONS AND LOOKUP
// ========================================================
export function getTests(): Test[] {
  return allTests;
}

export function getTestById(id: string): Test | undefined {
  return allTests.find(t => t.id === id);
}

// ========================================================
// 1. USER SESSION MANAGEMENT (AUTH)
// ========================================================

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading user session:', e);
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error writing user session:', e);
  }
}

export async function loginUser(studentCode: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const deviceToken = getOrGenerateDeviceToken();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_code', studentCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'PIN not found. Please register first.' };
        }
        throw error;
      }

      if (data) {
        // Update last login
        await supabase
          .from('users')
          .update({
            last_login: new Date().toISOString(),
            device_token: deviceToken
          })
          .eq('id', data.id);

        const user: User = {
          id: data.id,
          name: data.name,
          cadetNumber: data.cadet_number,
          studentCode: data.student_code
        };

        setCurrentUser(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.warn('Supabase login failed, entering offline fallback:', err);
      return { success: false, error: 'Database connection error. Try again.' };
    }
  }

  // Local storage offline fallback check
  const fallbackUsers = getFallbackUsers();
  const localUser = fallbackUsers.find(u => u.studentCode === studentCode);
  if (localUser) {
    setCurrentUser(localUser);
    return { success: true, user: localUser };
  }

  return { success: false, error: 'Offline PIN not found. Please register.' };
}

export async function registerUser(name: string, cadetNumber: string, studentCode: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const deviceToken = getOrGenerateDeviceToken();

  if (isSupabaseConfigured && supabase) {
    try {
      // Check if cadet number or code already exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`cadet_number.eq.${cadetNumber},student_code.eq.${studentCode}`)
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        return { success: false, error: 'Cadet Number or PIN already registered.' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          cadet_number: cadetNumber,
          student_code: studentCode,
          device_token: deviceToken,
          last_login: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          cadetNumber: data.cadet_number,
          studentCode: data.student_code
        };

        setCurrentUser(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.error('Supabase registration failed:', err);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  // Local storage offline fallback registration
  const fallbackUsers = getFallbackUsers();
  const exists = fallbackUsers.some(u => u.cadetNumber === cadetNumber || u.studentCode === studentCode);
  if (exists) {
    return { success: false, error: 'Cadet Number or PIN already registered locally.' };
  }

  const localUser: User = {
    id: `local-user-${Date.now()}`,
    name,
    cadetNumber,
    studentCode
  };

  fallbackUsers.push(localUser);
  saveFallbackUsers(fallbackUsers);
  setCurrentUser(localUser);

  return { success: true, user: localUser };
}

function getFallbackUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('nda_mock_fallback_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFallbackUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('nda_mock_fallback_users', JSON.stringify(users));
  } catch (e) {}
}

function getOrGenerateDeviceToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('nda_mock_device_token');
  if (!token) {
    token = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('nda_mock_device_token', token);
  }
  return token;
}

// ========================================================
// 2. DYNAMIC QUESTION FETCHING
// ========================================================

const questionsCache: Record<string, Question[]> = {};

export async function getQuestionsForTest(testId: string): Promise<Question[]> {
  if (questionsCache[testId]) {
    return questionsCache[testId];
  }
  const test = getTestById(testId);
  if (!test) return [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('questions').select('*');
      
      // If we have an exact sourceFileName configured, match it directly!
      if (test.sourceFileName) {
        query = query.eq('source_file', test.sourceFileName);
      } else {
        // Fallback fuzzy search rules
        if (test.category === 'maths_pack') {
          if (test.subCategory === 'chapter') {
            const idxMatch = test.title.match(/CT (\d+)/);
            const idx = idxMatch ? idxMatch[1] : '';
            if (idx) {
              query = query.or(`source_file.ilike.%CT ${idx}_%,source_file.ilike.%CT ${idx}.%,source_file.ilike.%CT_${idx}%`);
            } else {
              query = query.ilike('source_file', `%${test.title.replace(/NDA\s+/gi, '')}%`);
            }
          } else if (test.subCategory === 'subject') {
            const match = test.title.match(/ST (\d+)/);
            const num = match ? match[1] : '';
            if (num) {
              query = query.ilike('source_file', `%ST ${num}_%`);
            } else {
              const match2 = test.title.match(/ST \d+: (.+)/);
              const subjName = match2 ? match2[1] : '';
              if (subjName) {
                query = query.ilike('source_file', `%${subjName}%`);
              }
            }
          }
        } else if (test.category === 'pyp') {
          const match = test.title.match(/(20\d{2})/);
          const year = match ? match[1] : '';
          const isMath = test.subCategory === 'math';
          if (year) {
            query = query.ilike('source_file', `%${year}%`).ilike('source_file', isMath ? '%math%' : '%gat%');
          }
        } else if (test.category === 'full_mock') {
          const match = test.title.match(/Test (\d+)/);
          const num = match ? match[1] : '';
          const isMath = test.subCategory === 'math';
          if (num) {
            query = query
              .ilike('source_file', `%FT ${num}_%`)
              .ilike('source_file', isMath ? '%math%' : '%general%');
          } else {
            query = query.ilike('source_file', isMath ? '%math%' : '%general%');
          }
        }
      }

      const { data, error } = await query.order('question_number', { ascending: true, nullsFirst: false }).order('id', { ascending: true });
      if (error) throw error;

      if (data && data.length > 0) {
        // Fuzzy search might match multiple files (e.g. both Paper I and II for 2024)
        // We isolate the best matching source file to prevent 300-question combinations.
        const uniqueSourceFiles = Array.from(new Set(data.map((r: any) => r.source_file)));
        let selectedSourceFile = uniqueSourceFiles[0];

        if (uniqueSourceFiles.length > 1 && test.category === 'pyp') {
          const halfMatch = test.title.match(/NDA-(I|II)/);
          const half = halfMatch ? halfMatch[1] : null;
          if (half) {
            const matchedFile = uniqueSourceFiles.find((sf: any) => 
              typeof sf === 'string' && (sf.includes(`-${half}`) || sf.includes(`_${half}_`) || sf.includes(` ${half} `) || sf.includes(`${half}_`))
            );
            if (matchedFile) {
              selectedSourceFile = matchedFile;
            }
          }
        }

        const isolatedData = data.filter((row: any) => row.source_file === selectedSourceFile);
        console.log(`[Supabase] Loaded ${isolatedData.length} questions for test: ${testId} from ${selectedSourceFile}`);

        // Map database columns to Question interface
        const mapped = isolatedData.map((row: any) => ({
          id: row.id.toString(),
          type: (row.question_text.includes('pmatrix') || row.question_text.includes('\\frac') ? 'latex' : 'text') as 'latex' | 'text',
          questionText: row.question_text,
          comprehension: row.comprehension || undefined,
          options: [row.option_1, row.option_2, row.option_3, row.option_4],
          correctOptionIndex: row.correct_index,
          explanation: row.solution,
          questionNumber: row.question_number
        }));
        questionsCache[testId] = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn(`[Supabase] Question fetch failed for ${testId}, using local fallback:`, err);
    }
  }

  console.log(`[Local Fallback] Using mock fallback questions for test: ${testId}`);
  // Fallback to local generated data
  const fallback = generateQuestionsForTest(testId);
  questionsCache[testId] = fallback;
  return fallback;
}

// ========================================================
// 3. ATTEMPTS SYNCING
// ========================================================

function getLocalAttempts(): Record<string, Attempt> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalAttempts(attempts: Record<string, Attempt>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {}
}

export async function syncAttemptProgress(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number,
  currentQuestionIndex: number
): Promise<Attempt | null> {
  const attempts = getLocalAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  attempt.responses = responses;
  attempt.timeLeft = timeLeft;
  attempt.currentQuestionIndex = currentQuestionIndex;

  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  // Sync to Supabase
  const currentUser = getCurrentUser();
  if (isSupabaseConfigured && supabase && currentUser) {
    try {
      await supabase
        .from('test_attempts')
        .upsert({
          id: attemptId,
          user_id: currentUser.id,
          test_id: attempt.testId,
          score: attempt.score,
          correct_count: attempt.correctCount,
          incorrect_count: attempt.incorrectCount,
          unattempted_count: attempt.unattemptedCount,
          accuracy: attempt.accuracy,
          time_taken: attempt.timeTaken,
          responses: responses,
          completed_at: null
        });
    } catch (err) {
      console.warn('Supabase attempt sync failed:', err);
    }
  }

  return attempt;
}

export async function submitAttemptToSupabase(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number
): Promise<Attempt | null> {
  const attempts = getLocalAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  const test = getTestById(attempt.testId);
  if (!test) return null;

  const questions = await getQuestionsForTest(attempt.testId);
  
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const marksPerQuestion = test.marks / test.questionsCount;

  questions.forEach((q) => {
    const resp = responses[q.id];
    if (!resp) {
      unattemptedCount++;
      return;
    }

    if (resp.selectedOptionIndex === null) {
      unattemptedCount++;
    } else if (resp.selectedOptionIndex === q.correctOptionIndex) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const scoreRaw = (correctCount * marksPerQuestion) - (incorrectCount * test.negativeMarking);
  const score = Math.round(scoreRaw * 100) / 100;

  const totalAttempted = correctCount + incorrectCount;
  const accuracy = totalAttempted > 0 
    ? Math.round((correctCount / totalAttempted) * 100 * 100) / 100 
    : 0;

  // Relative percentile
  let percentile = 75;
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
  attempt.timeTaken = test.duration * 60 - timeLeft;
  attempt.completedAt = new Date().toISOString();

  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  // Send completed attempt to Supabase
  const currentUser = getCurrentUser();
  if (isSupabaseConfigured && supabase && currentUser) {
    try {
      await supabase
        .from('test_attempts')
        .upsert({
          id: attemptId,
          user_id: currentUser.id,
          test_id: attempt.testId,
          score: score,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          unattempted_count: unattemptedCount,
          accuracy: accuracy,
          time_taken: attempt.timeTaken,
          responses: responses,
          completed_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Failed to submit attempt to Supabase:', err);
    }
  }

  return attempt;
}

export function createAttempt(testId: string): Attempt | null {
  const test = getTestById(testId);
  if (!test) return null;

  // Note: questions will load dynamically in the active test, so we prepare layout empty responses
  const attemptId = `attempt-${Date.now()}`;
  const attempt: Attempt = {
    id: attemptId,
    testId,
    responses: {},
    timeLeft: test.duration * 60,
    currentQuestionIndex: 0,
    completed: false,
    score: 0,
    accuracy: 0,
    percentile: 0,
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: test.questionsCount,
    timeTaken: 0,
    startedAt: new Date().toISOString()
  };

  const attempts = getLocalAttempts();
  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  return attempt;
}

export function getAttempt(attemptId: string): Attempt | null {
  const attempts = getLocalAttempts();
  return attempts[attemptId] || null;
}

export function getRecentAttempts(): Attempt[] {
  const attempts = getLocalAttempts();
  return Object.values(attempts)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function fetchRecentAttemptsFromSupabase(userId: string): Promise<Attempt[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((row: any) => ({
          id: row.id,
          testId: row.test_id,
          responses: row.responses,
          timeLeft: 0, // not needed for reports
          currentQuestionIndex: 0,
          completed: row.completed_at !== null,
          score: Number(row.score),
          accuracy: Number(row.accuracy),
          percentile: 85, // default simulation relative percentile
          correctCount: row.correct_count,
          incorrectCount: row.incorrect_count,
          unattempted_count: row.unattempted_count,
          timeTaken: row.time_taken,
          startedAt: row.completed_at || new Date().toISOString()
        } as unknown as Attempt));
      }
    } catch (err) {
      console.warn('Failed to load attempts from Supabase, using local:', err);
    }
  }
  return getRecentAttempts();
}

// ========================================================
// 4. LEADERBOARD RANKINGS
// ========================================================

export async function getLeaderboardForTest(testId: string): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Query the dynamic SQL view we created
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('test_id', testId)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const currentUser = getCurrentUser();
        return data.map((row: any) => ({
          rank: row.rank,
          name: row.name,
          score: Number(row.score),
          accuracy: Number(row.accuracy),
          timeTaken: formatDuration(row.time_taken),
          isCurrentUser: currentUser ? row.cadet_number === currentUser.cadetNumber : false
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch Supabase leaderboard, using fallback:', err);
    }
  }

  // Fallback: No real leaderboard data is available yet, return empty list.
  return [];
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

// ========================================================
// 5. MOTIVATIONAL QUOTES
// ========================================================

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
  if (typeof window === 'undefined') return MOTIVATIONAL_QUOTES[0];
  const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[idx];
}
