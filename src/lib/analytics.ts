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

// Highly granular keyword matcher for chapter-wise NDA syllabus
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Matrices & Determinants': ['matrix', 'determinant', 'adjoint', 'inverse matrix', 'singular'],
  'Sets, Relations & Functions': ['set', 'relation', 'function', 'subset', 'domain', 'range', 'injective', 'surjective'],
  'Complex Numbers': ['complex number', 'iota', 'argand', 'modulus', 'argument', 'conjugate'],
  'Quadratic Equations': ['quadratic', 'roots', 'polynomial equation'],
  'Sequence & Series': ['progression', 'arithmetic', 'geometric', 'harmonic', 'series', 'sequence', 'a.p', 'g.p', 'sum to n terms'],
  'Permutations & Combinations': ['permutation', 'combination', 'arrange', 'select', 'factorial', 'ways to choose'],
  'Binomial Theorem': ['binomial', 'expansion', 'coefficient'],
  'Logarithms': ['logarithm', 'log ', 'ln '],
  'Trigonometry': ['sin', 'cos', 'tan', 'triangle', 'angle', 'radian', 'height', 'distance', 'inverse', 'sec', 'csc', 'cot'],
  'Differential Calculus': ['derivative', 'limit', 'continuous', 'differentiable', 'dy/dx', 'maxima', 'minima', 'tangent', 'normal'],
  'Integral Calculus': ['integral', 'integrate', 'area under', 'differential equation', 'dx'],
  '2D & 3D Geometry': ['line', 'plane', 'circle', 'parabola', 'ellipse', 'hyperbola', 'coordinate', 'distance formula', 'direction ratio', 'direction cosine'],
  'Vector Algebra': ['vector', 'magnitude', 'dot product', 'cross product', 'scalar triple', 'coplanar'],
  'Statistics & Probability': ['mean', 'median', 'mode', 'variance', 'standard deviation', 'probability', 'dice', 'coin', 'card', 'mutually exclusive', 'bayes'],
  'English Language': ['synonym', 'antonym', 'idiom', 'phrase', 'grammar', 'spot the error', 'sentence improvement', 'comprehension'],
  'Physics & Chemistry': ['force', 'velocity', 'acceleration', 'light', 'sound', 'electricity', 'magnet', 'atom', 'molecule', 'acid', 'base', 'reaction', 'optics'],
  'General Studies': ['history', 'geography', 'polity', 'constitution', 'economy', 'current affairs', 'war', 'treaty', 'article', 'cell', 'disease']
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
    // 1. Expand the search surface to include options and explanation
    const textToSearch = [
      q.questionText,
      ...(q.options || []),
      q.explanation || ''
    ].join(' ').toLowerCase();

    let assignedTopic = 'Other / Mixed';
    let maxScore = 0;

    // 2. Scoring System & Regex Boundaries
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      let topicScore = 0;
      
      for (const kw of keywords) {
        // Create a safe regex boundary for the keyword
        const prefix = /^\w/.test(kw) ? '\\b' : '';
        const suffix = /\w$/.test(kw) ? '\\b' : '';
        // Escape special regex characters in the keyword
        const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        try {
          const regex = new RegExp(`${prefix}${escapedKw}${suffix}`, 'g');
          const matches = textToSearch.match(regex);
          if (matches) {
            // Weight exact matches to prioritize them over fallback
            topicScore += matches.length * 2; 
          }
        } catch (e) {
          // Fallback for complex characters if regex fails
          if (textToSearch.includes(kw.toLowerCase())) {
            topicScore += 1;
          }
        }
      }

      if (topicScore > maxScore) {
        maxScore = topicScore;
        assignedTopic = topic;
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
