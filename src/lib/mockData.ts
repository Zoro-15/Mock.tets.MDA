import { Test, Question } from './types';

// Let's generate the 42 PYP papers
export const previousYearPapers: Test[] = [];

// Helper to find exact database source file names for PYPs
function getPypSourceFileName(year: number, half: string, subCategory: 'math' | 'gat'): string | undefined {
  if (subCategory === 'math') {
    if (year === 2025 && half === 'II') {
      return "NDA_II_2025_Mathematics_Official_Paper_Held_On_14_Sept_2025_.html";
    } else if (year === 2024 && half === 'II') {
      return "NDA-II 2024 _Maths_ Official Paper _Held On_ 01 Sept_ 2024_.html";
    } else if (year === 2017 && half === 'II') {
      return "NDA Mathematics 10 Sept 2017 Official Paper.html";
    } else if (year === 2016 && half === 'I') {
      return "NDA Mathematics 17 April 2016 Official Paper.html";
    } else if (year === 2021 && half === 'I') {
      return "NDA Mathematics 18 Apr 2021 Official Paper.html";
    } else if (year === 2020 && half === 'II') {
      return "NDA Mathematics 6 Sep 2020 Official Paper.html";
    } else if (year === 2018 && half === 'II') {
      return "NDA Mathematics 9 Sept 2018 Official Paper.html";
    }
  } else {
    if (year === 2022 && half === 'I') {
      return "NDA General Ability Test 10 April 2022 Official Paper.html";
    } else if (year === 2017 && half === 'II') {
      return "NDA General Ability Test 10 Sept 2017 Official Paper.html";
    } else if (year === 2021 && half === 'II') {
      return "NDA General Ability Test 14 Nov 2021 Official Paper.html";
    } else if (year === 2023 && half === 'I') {
      return "NDA General Ability Test 16 April 2023 Official Paper.html";
    } else if (year === 2015 && half === 'II') {
      return "NDA General Ability Test 16 Dec 2015 Official Paper.html";
    } else if (year === 2016 && half === 'I') {
      return "NDA General Ability Test 17 April 2016 Official Paper.html";
    } else if (year === 2019 && half === 'II') {
      return "NDA General Ability Test 17 Nov 2019 Official Paper.html";
    } else if (year === 2021 && half === 'I') {
      return "NDA General Ability Test 18 Apr 2021 Official Paper.html";
    } else if (year === 2016 && half === 'II') {
      return "NDA General Ability Test 18 Sept 2016 Official Paper.html";
    } else if (year === 2019 && half === 'I') {
      return "NDA General Ability Test 21 April 2019 Official Paper.html";
    } else if (year === 2018 && half === 'I') {
      return "NDA General Ability Test 22 April 2018 Official Paper.html";
    } else if (year === 2023 && half === 'II') {
      return "NDA General Ability Test 3 Sep 2023 Official Paper.html";
    } else if (year === 2020 && half === 'II') {
      return "NDA General Ability Test 6 Sep 2020 Official Paper.html";
    } else if (year === 2018 && half === 'II') {
      return "NDA General Ability Test 9 Sept 2018 Official Paper.html";
    }
  }
  return undefined;
}

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
      syllabus: ['Algebra', 'Matrices & Determinants', 'Trigonometry', 'Analytical Geometry', 'Differential Calculus', 'Integral Calculus', 'Vector Algebra', 'Probability & Statistics'],
      sourceFileName: getPypSourceFileName(year, half, 'math')
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
        syllabus: ['English (Vocabulary, Grammar, Comprehension)', 'General Knowledge (Physics, Chemistry, General Science, History, Geography, Civics)'],
        sourceFileName: getPypSourceFileName(year, half, 'gat')
      });
    }
  }
}

// Ensure exactly 21 of each
const mathPyps = previousYearPapers.filter(p => p.subCategory === 'math');
const gatPyps = previousYearPapers.filter(p => p.subCategory === 'gat');

// Mathematics Super Pack: 36 Tests (31 Chapter Tests, 5 Subject Tests)
export const mathsSuperPack: Test[] = [];

const databaseChapters = [
  { index: 1, title: "Set Theory & Types of Sets", file: "NDA CT 1_ Set Theory _ Types of Sets.html" },
  { index: 2, title: "Relations & Functions", file: "CT 2_ Relations _ Functions.html" },
  { index: 3, title: "Complex Numbers", file: "CT 3_ Complex Numbers.html" },
  { index: 4, title: "Binary System", file: "CT 4_ Binary System.html" },
  { index: 5, title: "Arithmetic Progression", file: "CT 5_ Arithmetic Progression.html" },
  { index: 6, title: "Geometric & Harmonic Progression", file: "CT 6_ Geometric _ Harmonic Progression.html" },
  { index: 7, title: "Quadratic Equations", file: "CT 7_ Quadratic Equations.html" },
  { index: 8, title: "Linear Inequalities", file: "CT 8_ Linear Inequalities.html" },
  { index: 9, title: "Permutation & Combination", file: "CT 9_ Permutation _ Combination.html" },
  { index: 10, title: "Binomial Theorem", file: "CT 10_ Binomial Theorem.html" },
  { index: 11, title: "Logarithms", file: "CT 11_ Logarithms.html" },
  { index: 12, title: "Matrices - I", file: "CT 12_ Matrices - I.html" },
  { index: 13, title: "Matrices - II", file: "CT 13_ Matrices - II.html" },
  { index: 14, title: "Determinants - I", file: "CT 14_ Determinants - I.html" },
  { index: 15, title: "Determinants - II", file: "CT 15_ Determinants - II.html" },
  { index: 16, title: "Trigonometry Fundamentals", file: "CT 16_ Trigonometry Fundamentals.html" },
  { index: 17, title: "Trigonometric Ratios", file: "CT 17_ Trigonometric Ratios.html" },
  { index: 18, title: "Trigonometric Identities", file: "CT 18_ Trigonometric Identities.html" },
  { index: 19, title: "Inverse Trigonometric Functions", file: "CT 19_ Inverse Trigonometric Functions.html" },
  { index: 20, title: "Heights & Distance", file: "CT 20_ Heights _ Distance.html" },
  { index: 21, title: "Lines", file: "CT 21_ Lines.html" },
  { index: 22, title: "Circles", file: "CT 22_ Circles.html" },
  { index: 23, title: "Parabola", file: "CT 23_ Parabola.html" },
  { index: 24, title: "Ellipse", file: "CT 24_ Ellipse.html" },
  { index: 25, title: "Hyperbola", file: "CT 25_ Hyperbola.html" },
  { index: 26, title: "Three Dimensional Geometry - I", file: "CT 26_ Three Dimensional Geometry - I.html" },
  { index: 27, title: "Three Dimensional Geometry - II", file: "CT 27_ Three Dimensional Geometry - II.html" },
  { index: 28, title: "Functions", file: "CT 28_ Functions.html" },
  { index: 29, title: "Limits & Continuity", file: "CT 29_ Limits _ Continuity.html" },
  { index: 30, title: "Continuity & Differentiability", file: "CT 30_ Continuity _ Differentiability.html" },
  { index: 31, title: "Derivatives", file: "CT 31_ Derivatives.html" }
];

databaseChapters.forEach((ch) => {
  mathsSuperPack.push({
    id: `maths-pack-chapter-${ch.index}`,
    title: `NDA CT ${ch.index}: ${ch.title}`,
    category: 'maths_pack',
    subCategory: 'chapter',
    questionsCount: 10,
    duration: 13,
    marks: 25,
    negativeMarking: 0.83,
    syllabus: [ch.title],
    sourceFileName: ch.file
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

export function generateQuestionsForTest(testId: string): Question[] {
  const test = allTests.find(t => t.id === testId);
  if (!test) return [];

  const list: Question[] = [];
  const testNumber = parseInt(testId.replace(/\D/g, '')) || 1;

  for (let i = 0; i < test.questionsCount; i++) {
    const num = i + 1;
    const qId = `${testId}-q-${num}`;
    const title = test.title;

    if (test.subCategory === 'gat') {
      const section = num <= 50 ? 'Part A: English (Questions 1-50)' : 'Part B: General Knowledge (Questions 51-150)';
      
      if (num <= 50) {
        const vocab = [
          { w: "Obstinate", s: "Stubborn", a: "Flexible" }, { w: "Transparent", s: "Clear", a: "Opaque" },
          { w: "Diligent", s: "Hardworking", a: "Lazy" }, { w: "Resilient", s: "Tough", a: "Fragile" },
          { w: "Candid", s: "Frank", a: "Deceitful" }, { w: "Meticulous", s: "Careful", a: "Careless" },
          { w: "Valiant", s: "Brave", a: "Cowardly" }, { w: "Pragmatic", s: "Practical", a: "Impractical" },
          { w: "Benevolent", s: "Kind", a: "Cruel" }, { w: "Gregarious", s: "Sociable", a: "Introverted" },
          { w: "Lucid", s: "Clear", a: "Confusing" }, { w: "Ephemeral", s: "Short-lived", a: "Permanent" },
          { w: "Mitigate", s: "Reduce", a: "Increase" }, { w: "Alleviate", s: "Ease", a: "Worsen" },
          { w: "Profound", s: "Deep", a: "Shallow" }, { w: "Ambiguous", s: "Unclear", a: "Explicit" },
          { w: "Frugal", s: "Thrifty", a: "Wasteful" }, { w: "Intrepid", s: "Fearless", a: "Timid" },
          { w: "Jovial", s: "Cheerful", a: "Gloomy" }, { w: "Keen", s: "Sharp", a: "Dull" },
          { w: "Lethargic", s: "Sluggish", a: "Energetic" }, { w: "Novice", s: "Beginner", a: "Expert" },
          { w: "Obsolete", s: "Outdated", a: "Current" }, { w: "Placid", s: "Calm", a: "Turbulent" },
          { w: "Quell", s: "Suppress", a: "Encourage" }
        ];
        
        const isSynonym = num % 2 === 1;
        const vIdx = ((num - 1) + testNumber) % vocab.length;
        const item = vocab[vIdx];
        
        const questionText = isSynonym 
          ? `[Q.${num}] What is the closest synonym for the word '${item.w}'?`
          : `[Q.${num}] Select the best antonym for the word '${item.w}'.`;
          
        const correctAns = isSynonym ? item.s : item.a;
        
        // Pick 3 distractors from other vocab items
        const d1 = vocab[(vIdx + 1) % vocab.length][isSynonym ? 's' : 'a'];
        const d2 = vocab[(vIdx + 2) % vocab.length][isSynonym ? 'a' : 's'];
        const d3 = vocab[(vIdx + 3) % vocab.length][isSynonym ? 's' : 'a'];
        
        const options = [correctAns, d1, d2, d3];
        // Scramble based on testNumber
        const correctIdx = (num + testNumber) % 4;
        options[0] = options[correctIdx];
        options[correctIdx] = correctAns;
        
        list.push({
          id: qId,
          type: 'text',
          questionText,
          options,
          correctOptionIndex: correctIdx,
          explanation: `The ${isSynonym ? 'synonym' : 'antonym'} of ${item.w} is ${correctAns}.`,
          section
        });
      } else {
        const gkFacts = [
          { q: "Who was the founder of the Brahmo Samaj?", ans: "Raja Ram Mohan Roy", d: ["Swami Vivekananda", "Dayananda Saraswati", "Ishwar Chandra"] },
          { q: "What is the main constituent of Liquefied Petroleum Gas (LPG)?", ans: "Butane", d: ["Methane", "Ethane", "Hydrogen"] },
          { q: "An object placed at the principal focus of a concave mirror forms an image at:", ans: "Infinity", d: ["Focus", "Center of Curvature", "Pole"] },
          { q: "The 'Directive Principles of State Policy' were borrowed from the constitution of:", ans: "Ireland", d: ["USA", "UK", "USSR"] },
          { q: "Which planet is known as the 'Morning Star'?", ans: "Venus", d: ["Mars", "Jupiter", "Mercury"] },
          { q: "Which acid is present in red ants?", ans: "Formic Acid", d: ["Acetic Acid", "Malic Acid", "Nitric Acid"] },
          { q: "Who discovered Penicillin?", ans: "Alexander Fleming", d: ["Marie Curie", "Isaac Newton", "Albert Einstein"] },
          { q: "What is the SI unit of Force?", ans: "Newton", d: ["Joule", "Watt", "Pascal"] },
          { q: "Which blood group is the universal donor?", ans: "O-", d: ["A+", "B+", "AB+"] },
          { q: "Who wrote the Indian National Anthem?", ans: "Rabindranath Tagore", d: ["Bankim Chandra", "Sarojini Naidu", "Mahatma Gandhi"] },
          { q: "What is the chemical formula of Water?", ans: "H2O", d: ["CO2", "O2", "NaCl"] },
          { q: "Which is the largest ocean on Earth?", ans: "Pacific Ocean", d: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] },
          { q: "Who is known as the Missile Man of India?", ans: "APJ Abdul Kalam", d: ["Vikram Sarabhai", "Homi Bhabha", "C.V. Raman"] },
          { q: "Which gas is most abundant in the Earth's atmosphere?", ans: "Nitrogen", d: ["Oxygen", "Carbon Dioxide", "Hydrogen"] },
          { q: "What is the capital of Australia?", ans: "Canberra", d: ["Sydney", "Melbourne", "Perth"] },
          { q: "Who painted the Mona Lisa?", ans: "Leonardo da Vinci", d: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo"] },
          { q: "Which is the smallest continent?", ans: "Australia", d: ["Europe", "Antarctica", "South America"] },
          { q: "What is the hardest natural substance on Earth?", ans: "Diamond", d: ["Gold", "Iron", "Platinum"] },
          { q: "In which year did India gain independence?", ans: "1947", d: ["1945", "1950", "1952"] },
          { q: "What is the boiling point of water in Celsius?", ans: "100", d: ["90", "110", "120"] }
        ];

        const fIdx = ((num - 51) + testNumber) % gkFacts.length;
        const fact = gkFacts[fIdx];
        
        const questionText = `[Q.${num}] ${fact.q}`;
        const options = [fact.ans, fact.d[0], fact.d[1], fact.d[2]];
        
        // Scramble based on testNumber
        const correctIdx = (num + testNumber) % 4;
        options[0] = options[correctIdx];
        options[correctIdx] = fact.ans;

        list.push({
          id: qId,
          type: 'text',
          questionText,
          options,
          correctOptionIndex: correctIdx,
          explanation: `The correct answer is ${fact.ans}.`,
          section
        });
      }
    } else {
      // Math
      const upperLimit = testNumber;
      const coeff = testNumber * num;
      
      const mathTemplates = [
        {
          text: `Evaluate the integral:\n\n$$\\int_{0}^{${upperLimit}} ${coeff}x^2 \\, dx$$`,
          ops: [`$${coeff}$`, `$${coeff * 2}$`, `$${coeff * 3}$`, `$${coeff * 4}$`]
        },
        {
          text: `Find the determinant of the matrix $A$:\n\n$$A = \\begin{pmatrix} ${coeff} & 2 \\\\ 1 & ${upperLimit} \\end{pmatrix}$$`,
          ops: [`$${(coeff * upperLimit) - 2}$`, `$${coeff * upperLimit}$`, `$${coeff + upperLimit}$`, `$${coeff - upperLimit}$`]
        },
        {
          text: `Evaluate the limit:\n\n$$\\lim_{x \\to 0} \\frac{\\sin(${coeff}x)}{${upperLimit}x}$$`,
          ops: [`$\\frac{${coeff}}{${upperLimit}}$`, `$${coeff}$`, `$${upperLimit}$`, `$0$`]
        },
        {
          text: `Find the derivative of $f(x) = ${coeff}x^{${upperLimit}}$ with respect to $x$, evaluated at $x = 1$.`,
          ops: [`$${coeff * upperLimit}$`, `$${coeff}$`, `$${upperLimit}$`, `$${coeff + upperLimit}$`]
        },
        {
          text: `Given vector $\\vec{a} = ${coeff}\\hat{i} + ${upperLimit}\\hat{j}$, find the square of its magnitude $|\\vec{a}|^2$.`,
          ops: [`$${(coeff*coeff) + (upperLimit*upperLimit)}$`, `$${coeff + upperLimit}$`, `$${coeff * upperLimit}$`, `$${(coeff*coeff) - (upperLimit*upperLimit)}$`]
        },
        {
          text: `Find the modulus of the complex number $z = ${coeff} + ${upperLimit}i$.`,
          ops: [`$\\sqrt{${(coeff*coeff) + (upperLimit*upperLimit)}}$`, `$${coeff + upperLimit}$`, `$${(coeff*coeff) + (upperLimit*upperLimit)}$`, `$${coeff}$`]
        },
        {
          text: `If the $n^{th}$ term of an Arithmetic Progression is $T_n = ${coeff}n + ${upperLimit}$, find the first term $T_1$.`,
          ops: [`$${coeff + upperLimit}$`, `$${coeff}$`, `$${upperLimit}$`, `$${coeff * upperLimit}$`]
        },
        {
          text: `Find the discriminant of the quadratic equation $x^2 + ${coeff}x + ${upperLimit} = 0$.`,
          ops: [`$${coeff * coeff - 4 * upperLimit}$`, `$${coeff * coeff + 4 * upperLimit}$`, `$${coeff * coeff - upperLimit}$`, `$${coeff - 4 * upperLimit}$`]
        },
        {
          text: `Simplify the trigonometric expression: $\\cos^2(${coeff}x) + \\sin^2(${coeff}x) + ${upperLimit}$.`,
          ops: [`$${1 + upperLimit}$`, `$${upperLimit}$`, `$${coeff + upperLimit}$`, `$${coeff}$`]
        },
        {
          text: `Find the sum of the first ${upperLimit} natural numbers multiplied by ${coeff}.`,
          ops: [`$${coeff * (upperLimit * (upperLimit + 1)) / 2}$`, `$${coeff * upperLimit}$`, `$${(upperLimit * (upperLimit + 1)) / 2}$`, `$${coeff + upperLimit}$`]
        },
        {
          text: `Find the maximum value of $f(x) = -x^2 + ${coeff}x - ${upperLimit}$.`,
          ops: [`$\\frac{${coeff * coeff - 4 * upperLimit}}{4}$`, `$${coeff}$`, `$${upperLimit}$`, `$0$`]
        },
        {
          text: `A line passes through $(0, ${coeff})$ and $( ${upperLimit}, 0)$. Find its slope.`,
          ops: [`$-\\frac{${coeff}}{${upperLimit}}$`, `$\\frac{${coeff}}{${upperLimit}}$`, `$${coeff}$`, `$-${upperLimit}$`]
        },
        {
          text: `Find the area of a rectangle with length ${coeff} and width ${upperLimit}.`,
          ops: [`$${coeff * upperLimit}$`, `$${2 * (coeff + upperLimit)}$`, `$${coeff + upperLimit}$`, `$${coeff / upperLimit}$`]
        },
        {
          text: `If $A$ and $B$ are independent events with $P(A) = \\frac{1}{${upperLimit + 1}}$ and $P(B) = \\frac{1}{${coeff + 1}}$, find $P(A \\cap B)$.`,
          ops: [`$\\frac{1}{${(upperLimit + 1) * (coeff + 1)}}$`, `$\\frac{1}{${upperLimit + coeff + 2}}$`, `$\\frac{${upperLimit + 1}}{${coeff + 1}}$`, `$1$`]
        },
        {
          text: `Find the value of $k$ if the vectors $k\\hat{i} + ${coeff}\\hat{j}$ and $${upperLimit}\\hat{i} - \\hat{j}$ are perpendicular.`,
          ops: [`$\\frac{${coeff}}{${upperLimit}}$`, `$${coeff * upperLimit}$`, `$-\\frac{${coeff}}{${upperLimit}}$`, `$${coeff}$`]
        },
        {
          text: `Evaluate $\\log_{${upperLimit + 1}} (${upperLimit + 1}^{${coeff}})$.`,
          ops: [`$${coeff}$`, `$${upperLimit + 1}$`, `$${coeff * (upperLimit + 1)}$`, `$0$`]
        },
        {
          text: `Find the distance between the origin and the point $(${coeff}, ${upperLimit})$.`,
          ops: [`$\\sqrt{${coeff*coeff + upperLimit*upperLimit}}$`, `$${coeff + upperLimit}$`, `$${coeff*coeff + upperLimit*upperLimit}$`, `$${coeff}$`]
        },
        {
          text: `Calculate the factorial expression: $\\frac{${upperLimit + 2}!}{${upperLimit}!}$.`,
          ops: [`$${(upperLimit + 2) * (upperLimit + 1)}$`, `$${upperLimit + 2}$`, `$${upperLimit + 1}$`, `$0$`]
        },
        {
          text: `Find the radius of the circle given by $x^2 + y^2 = ${coeff * coeff}$.`,
          ops: [`$${coeff}$`, `$${coeff * coeff}$`, `$${2 * coeff}$`, `$${coeff / 2}$`]
        },
        {
          text: `What is the dot product of $\\vec{u} = ${coeff}\\hat{i}$ and $\\vec{v} = ${upperLimit}\\hat{i}$?`,
          ops: [`$${coeff * upperLimit}$`, `$${coeff + upperLimit}$`, `$0$`, `$1$`]
        }
      ];

      const tmpl = mathTemplates[num % mathTemplates.length];
      
      list.push({
        id: qId,
        type: 'latex',
        questionText: tmpl.text,
        options: tmpl.ops,
        correctOptionIndex: num % 4,
        explanation: `Explanation for math question ${num} of ${title}.`
      });
    }
  }

  return list;
}
