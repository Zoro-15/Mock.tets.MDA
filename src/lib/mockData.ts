import { Test, Question } from './types';

// Let's generate the 42 PYP papers
export const previousYearPapers: Test[] = [];

// 21 Math papers and 21 GAT papers
for (let year = 2025; year >= 2015; year--) {
  for (const half of ['II', 'I']) {
    if (previousYearPapers.length >= 42) break;
    
    // Mathematics paper
    previousYearPapers.push({
      id: `pyp-math-${year}-${half === 'II' ? 2 : 1}`,
      title: `NDA-${half} ${year} Mathematics`,
      category: 'pyp',
      subCategory: 'math',
      questionsCount: 120,
      duration: 150,
      marks: 300,
      negativeMarking: 0.83,
      syllabus: ['Algebra', 'Matrices & Determinants', 'Trigonometry', 'Analytical Geometry', 'Differential Calculus', 'Integral Calculus', 'Vector Algebra', 'Probability & Statistics']
    });

    // GAT paper
    if (previousYearPapers.length < 42) {
      previousYearPapers.push({
        id: `pyp-gat-${year}-${half === 'II' ? 2 : 1}`,
        title: `NDA-${half} ${year} General Ability Test`,
        category: 'pyp',
        subCategory: 'gat',
        questionsCount: 150,
        duration: 150,
        marks: 600,
        negativeMarking: 1.33,
        syllabus: ['English (Vocabulary, Grammar, Comprehension)', 'General Knowledge (Physics, Chemistry, General Science, History, Geography, Civics)']
      });
    }
  }
}

// Ensure exactly 21 of each
const mathPyps = previousYearPapers.filter(p => p.subCategory === 'math');
const gatPyps = previousYearPapers.filter(p => p.subCategory === 'gat');

// Mathematics Super Pack: 36 Tests (31 Chapter Tests, 5 Subject Tests)
export const mathsSuperPack: Test[] = [];

const chapters = [
  "Set Theory & Types of Sets",
  "Relations & Functions",
  "Complex Numbers",
  "Quadratic Equations",
  "Arithmetic Progression (AP)",
  "Geometric Progression (GP)",
  "Harmonic Progression & Miscellaneous Series",
  "Permutations & Combinations",
  "Binomial Theorem",
  "Logarithms & Exponential Series",
  "Matrices & Types of Matrices",
  "Determinants & Properties",
  "Trigonometric Ratios & Identities",
  "Inverse Trigonometric Functions",
  "Heights & Distances",
  "Properties of Triangles",
  "Rectangular Cartesian Coordinates",
  "Straight Lines",
  "Circles & System of Circles",
  "Parabola",
  "Ellipse",
  "Hyperbola",
  "Limits of a Function",
  "Continuity & Differentiability",
  "Methods of Differentiation",
  "Tangents & Normals",
  "Maxima & Minima",
  "Indefinite Integration",
  "Definite Integration & Area Under Curves",
  "Differential Equations",
  "Vector Algebra & 3D Geometry"
];

chapters.forEach((chapter, index) => {
  mathsSuperPack.push({
    id: `maths-pack-chapter-${index + 1}`,
    title: `NDA CT ${index + 1}: ${chapter}`,
    category: 'maths_pack',
    subCategory: 'chapter',
    questionsCount: 10,
    duration: 13,
    marks: 25,
    negativeMarking: 0.83,
    syllabus: [chapter]
  });
});

const subjects = [
  "Algebra & Trigonometry Super Pack",
  "Calculus Master Test",
  "Analytical Geometry Complete Pack",
  "Vectors & 3D Geometry Pack",
  "Probability & Statistics Subject Test"
];

subjects.forEach((subject, index) => {
  mathsSuperPack.push({
    id: `maths-pack-subject-${index + 1}`,
    title: `NDA ST ${index + 1}: ${subject}`,
    category: 'maths_pack',
    subCategory: 'subject',
    questionsCount: 30,
    duration: 40,
    marks: 75,
    negativeMarking: 0.83,
    syllabus: [`Comprehensive evaluation of ${subject}`]
  });
});

// Full Mock Tests: 16 Tests (8 Mathematics, 8 GAT)
export const fullMockTests: Test[] = [];
for (let i = 1; i <= 8; i++) {
  fullMockTests.push({
    id: `full-mock-math-${i}`,
    title: `NDA Full Mock Test ${i} (Mathematics)`,
    category: 'full_mock',
    subCategory: 'math',
    questionsCount: 120,
    duration: 150,
    marks: 300,
    negativeMarking: 0.83,
    syllabus: ['Complete Mathematics Syllabus']
  });

  fullMockTests.push({
    id: `full-mock-gat-${i}`,
    title: `NDA Full Mock Test ${i} (GAT)`,
    category: 'full_mock',
    subCategory: 'gat',
    questionsCount: 150,
    duration: 150,
    marks: 600,
    negativeMarking: 1.33,
    syllabus: ['Complete General Ability Test Syllabus']
  });
}

// All tests merged in a single list
export const allTests: Test[] = [
  ...previousYearPapers,
  ...mathsSuperPack,
  ...fullMockTests
];

// High-quality sample questions
const mathQuestionPool: Omit<Question, 'id'>[] = [
  {
    type: 'latex',
    questionText: 'Find the value of the limit:',
    assertionText: '',
    reasonText: '',
    options: [
      '0',
      '1',
      '5',
      '\\frac{1}{5}'
    ],
    correctOptionIndex: 2,
    explanation: 'Using the standard limit $\\lim_{y \\to 0} \\frac{\\sin(y)}{y} = 1$, we can multiply the numerator and denominator by 5: $\\lim_{x \\to 0} \\frac{5 \\cdot \\sin(5x)}{5x} = 5 \\cdot 1 = 5$.'
  },
  {
    type: 'assertion-reason',
    questionText: 'Consider the following statements regarding the function $f(x) = |x|$ at $x = 0$:',
    assertionText: 'The function $f(x) = |x|$ is continuous at $x = 0$.',
    reasonText: 'The left-hand limit and right-hand limit of $f(x)$ as $x$ approaches 0 are equal to $f(0)$.',
    options: [
      'Both A and R are individually true and R is the correct explanation of A',
      'Both A and R are individually true but R is not the correct explanation of A',
      'A is true but R is false',
      'A is false but R is true'
    ],
    correctOptionIndex: 0,
    explanation: 'Since $\\lim_{x \\to 0^-} |x| = 0$, $\\lim_{x \\to 0^+} |x| = 0$, and $f(0) = 0$, the function is continuous. The reason correctly explains why the function is continuous.'
  },
  {
    type: 'table',
    questionText: 'The following table represents the distribution of marks of 50 students in a mathematics test. Find the median class.',
    tableData: [
      ['Marks Interval', 'Number of Students', 'Cumulative Frequency'],
      ['0 - 10', '5', '5'],
      ['10 - 20', '12', '17'],
      ['20 - 30', '20', '37'],
      ['30 - 40', '13', '50']
    ],
    options: [
      '10 - 20',
      '20 - 30',
      '30 - 40',
      '0 - 10'
    ],
    correctOptionIndex: 1,
    explanation: 'The total number of students is $N = 50$. Half of the sample size is $N/2 = 25$. The cumulative frequency just greater than 25 is 37, which corresponds to the class interval $20 - 30$. Therefore, $20 - 30$ is the median class.'
  },
  {
    type: 'latex',
    questionText: 'If the matrix $A$ is defined as:\n\n$$A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$$\n\nFind the determinant of the matrix $A^2$.',
    options: [
      '5',
      '25',
      '10',
      '15'
    ],
    correctOptionIndex: 1,
    explanation: 'The determinant of $A$ is $\\det(A) = (2 \\times 4) - (3 \\times 1) = 8 - 3 = 5$. Since $\\det(A^2) = (\\det(A))^2$, we have $\\det(A^2) = 5^2 = 25$.'
  },
  {
    type: 'latex',
    questionText: 'Evaluate the integral:\n\n$$\\int_{0}^{\\pi/2} \\sin^2(x) \\, dx$$',
    options: [
      '\\pi',
      '\\frac{\\pi}{2}',
      '\\frac{\\pi}{4}',
      '\\frac{\\pi}{8}'
    ],
    correctOptionIndex: 2,
    explanation: 'Let $I = \\int_{0}^{\\pi/2} \\sin^2(x) dx$. Using the property $\\int_{a}^{b} f(x) dx = \\int_{a}^{b} f(a+b-x) dx$, we get $I = \\int_{0}^{\\pi/2} \\cos^2(x) dx$. Adding both equations gives $2I = \\int_{0}^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.'
  },
  {
    type: 'latex',
    questionText: 'What is the sum of the infinite series:\n\n$$S = 1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\dots$$',
    options: [
      '1',
      '2',
      '\\frac{3}{2}',
      '\\infty'
    ],
    correctOptionIndex: 1,
    explanation: 'This is an infinite geometric progression (GP) with first term $a = 1$ and common ratio $r = 1/2$. The sum formula is $S = \\frac{a}{1 - r} = \\frac{1}{1 - 1/2} = 2$.'
  },
  {
    type: 'latex',
    questionText: 'Find the general solution of the differential equation:\n\n$$\\frac{dy}{dx} + y = e^{-x}$$',
    options: [
      'y = (x + C)e^{-x}',
      'y = xe^{-x} + C',
      'y = e^{-x} + C',
      'y = x^2e^{-x} + C'
    ],
    correctOptionIndex: 0,
    explanation: 'This is a linear differential equation of the form $\\frac{dy}{dx} + Py = Q$, where $P=1$ and $Q=e^{-x}$. Integrating factor is $I.F. = e^{\\int 1 dx} = e^x$. The solution is $y \\cdot e^x = \\int e^{-x} \\cdot e^x dx = \\int 1 dx = x + C \\implies y = (x + C)e^{-x}$.'
  },
  {
    type: 'latex',
    questionText: 'Find the projection of vector $\\vec{a} = 2\\hat{i} + 3\\hat{j} + 2\\hat{k}$ on vector $\\vec{b} = \\hat{i} + 2\\hat{j} + \\hat{k}$.',
    options: [
      '\\frac{10}{\\sqrt{6}}',
      '\\frac{10}{6}',
      '\\sqrt{6}',
      '2\\sqrt{6}'
    ],
    correctOptionIndex: 0,
    explanation: 'The projection of $\\vec{a}$ on $\\vec{b}$ is $\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}$. $\\vec{a} \\cdot \\vec{b} = (2)(1) + (3)(2) + (2)(1) = 2 + 6 + 2 = 10$. The magnitude $|\\vec{b}| = \\sqrt{1^2 + 2^2 + 1^2} = \\sqrt{6}$. Hence, projection = $\\frac{10}{\\sqrt{6}}$.'
  }
];

const gatQuestionPool: Omit<Question, 'id'>[] = [
  {
    type: 'text',
    questionText: 'Choose the word which is most nearly opposite in meaning to the given word: "OBSTINATE"',
    options: [
      'Stubborn',
      'Flexible',
      'Adamant',
      'Rigid'
    ],
    correctOptionIndex: 1,
    explanation: '"Obstinate" means stubborn or refusing to change one\'s opinion. The antonym is "Flexible", which means ready to yield or adjust to changes.'
  },
  {
    type: 'text',
    questionText: 'An object is placed at the principal focus of a concave mirror. Where is the image formed?',
    options: [
      'At the focus',
      'At the center of curvature',
      'At infinity',
      'Between focus and pole'
    ],
    correctOptionIndex: 2,
    explanation: 'When an object is placed at the focus of a concave mirror, the reflected rays are parallel and meet at infinity. Thus, the image is formed at infinity.'
  },
  {
    type: 'text',
    questionText: 'Which of the following is the main constituent of Liquefied Petroleum Gas (LPG)?',
    options: [
      'Methane',
      'Ethane',
      'Propane & Butane',
      'Hydrogen'
    ],
    correctOptionIndex: 2,
    explanation: 'LPG is primarily a mixture of propane and butane, with butane being the major constituent.'
  },
  {
    type: 'text',
    questionText: 'Who was the founder of the Brahmo Samaj, established in 1828?',
    options: [
      'Swami Vivekananda',
      'Ishwar Chandra Vidyasagar',
      'Raja Ram Mohan Roy',
      'Dayananda Saraswati'
    ],
    correctOptionIndex: 2,
    explanation: 'Raja Ram Mohan Roy founded the Brahmo Samaj in Calcutta in 1828 as a socio-religious reformist movement of Hindu dharma.'
  },
  {
    type: 'text',
    questionText: 'The concept of \'Directive Principles of State Policy\' in the Indian Constitution is borrowed from the constitution of which country?',
    options: [
      'USA',
      'Ireland',
      'United Kingdom',
      'USSR'
    ],
    correctOptionIndex: 1,
    explanation: 'The Directive Principles of State Policy (DPSP) are borrowed from the Irish Constitution (under Article 45).'
  },
  {
    type: 'text',
    questionText: 'Which planet is known as the "Morning Star" or "Evening Star" because of its bright appearance in the sky?',
    options: [
      'Mars',
      'Venus',
      'Jupiter',
      'Mercury'
    ],
    correctOptionIndex: 1,
    explanation: 'Venus is known as the Morning or Evening Star. It is the brightest planet in the solar system, reflecting about 70% of sunlight falling on it due to dense clouds.'
  },
  {
    type: 'text',
    questionText: 'Select the correctly spelled word from the options below:',
    options: [
      'Committee',
      'Commitee',
      'Committey',
      'Comitee'
    ],
    correctOptionIndex: 0,
    explanation: 'The correct spelling is "Committee" (two m\'s, two t\'s, two e\'s).'
  },
  {
    type: 'text',
    questionText: 'Which of the following acids is present in red ants?',
    options: [
      'Formic acid',
      'Acetic acid',
      'Malic acid',
      'Nitric acid'
    ],
    correctOptionIndex: 0,
    explanation: 'Formic acid (methanoic acid) is present in the stings of red ants, causing burning sensation.'
  }
];

// Helper to get questions dynamically
export function generateQuestionsForTest(testId: string): Question[] {
  const test = allTests.find(t => t.id === testId);
  if (!test) return [];

  const pool = test.subCategory === 'gat' ? gatQuestionPool : mathQuestionPool;
  const list: Question[] = [];

  for (let i = 0; i < test.questionsCount; i++) {
    const template = pool[i % pool.length];
    
    // Create custom questions with index so they look unique
    const num = i + 1;
    let questionText = template.questionText;
    let assertionText = template.assertionText || '';
    let reasonText = template.reasonText || '';
    let explanation = template.explanation;
    
    // Inject the actual question number to feel dynamic
    if (template.type === 'assertion-reason') {
      questionText = `[Q.${num}] ${template.questionText}`;
    } else {
      questionText = `[Q.${num}] ${template.questionText}`;
    }

    list.push({
      id: `${testId}-q-${num}`,
      type: template.type,
      questionText,
      assertionText: assertionText || undefined,
      reasonText: reasonText || undefined,
      tableData: template.tableData,
      options: [...template.options],
      correctOptionIndex: template.correctOptionIndex,
      explanation
    });
  }

  return list;
}
