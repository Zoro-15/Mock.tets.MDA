import { Question, QuestionResponse } from './types';

export interface TopicInsight {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeSpent: number; // in seconds
  accuracy: number; // percentage
}

// Simple but extremely fast keyword matcher for NDA syllabus
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Algebra & Matrices': ['matrix', 'determinant', 'equation', 'roots', 'quadratic', 'complex number', 'set', 'relation', 'function', 'binomial', 'progression'],
  'Trigonometry': ['sin', 'cos', 'tan', 'triangle', 'angle', 'radian', 'height', 'distance', 'inverse'],
  'Calculus': ['derivative', 'integral', 'limit', 'continuous', 'differentiable', 'dy/dx', 'area under', 'differential equation'],
  'Geometry & Vectors': ['line', 'plane', 'circle', 'parabola', 'ellipse', 'hyperbola', 'vector', 'magnitude', 'direction ratio'],
  'Stats & Probability': ['mean', 'median', 'mode', 'variance', 'standard deviation', 'probability', 'dice', 'coin', 'card', 'mutually exclusive'],
  'English Language': ['synonym', 'antonym', 'idiom', 'phrase', 'grammar', 'spot the error', 'sentence improvement', 'comprehension'],
  'General Science': ['force', 'velocity', 'acceleration', 'light', 'sound', 'electricity', 'magnet', 'atom', 'molecule', 'acid', 'base', 'cell', 'disease'],
  'General Studies': ['history', 'geography', 'polity', 'constitution', 'economy', 'current affairs', 'war', 'treaty', 'article']
};

export function generateSubjectAnalytics(
  questions: Question[],
  responses: Record<string, QuestionResponse>
): TopicInsight[] {
  const insights: Record<string, TopicInsight> = {};

  // Initialize insights
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    insights[topic] = { topic, total: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0, accuracy: 0 };
  });
  insights['Other / Mixed'] = { topic: 'Other / Mixed', total: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0, accuracy: 0 };

  for (const q of questions) {
    const textToSearch = q.questionText.toLowerCase();
    let assignedTopic = 'Other / Mixed';

    // Fast keyword lookup
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some(kw => textToSearch.includes(kw))) {
        assignedTopic = topic;
        break;
      }
    }

    const resp = responses[q.id];
    const stat = insights[assignedTopic];
    stat.total += 1;
    
    if (resp) {
      stat.timeSpent += resp.timeSpent || 0;
      if (resp.selectedOptionIndex === null) {
        stat.unattempted += 1;
      } else if (resp.selectedOptionIndex === q.correctOptionIndex) {
        stat.correct += 1;
      } else {
        stat.incorrect += 1;
      }
    } else {
      stat.unattempted += 1;
    }
  }

  // Filter out empty topics and calculate accuracy
  const result = Object.values(insights).filter(t => t.total > 0);
  
  result.forEach(t => {
    const attempted = t.correct + t.incorrect;
    t.accuracy = attempted > 0 ? Math.round((t.correct / attempted) * 100) : 0;
  });

  // Sort by total questions descending to show most prominent topics first
  return result.sort((a, b) => b.total - a.total);
}
