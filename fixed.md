# NDA Mock Test Platform - Fix Report

## What was wrong
1. **Massive Question Duplication (Data Leak)**: The `generateQuestionsForTest` helper in `mockData.ts` was generating mock tests by repeatedly looping through a tiny static array of 8 sample questions. All 94 tests (Maths and GAT) were pulling from the exact same tiny pool over and over.
2. **GAT Mocks Missing Section Division**: The test data structure had no capability to differentiate between Part A (English) and Part B (General Knowledge) for GAT papers. The UI components (Question Palette and Header) were completely unaware of sections and grouped all 150 questions into one massive list.
3. **LaTeX Rendering Bug (Limits & Matrices)**: 
    - The `LatexRenderer.tsx` contained a dangerous HTML stripping regex (`/<[^>]+>/g`) that incorrectly stripped valid math expressions containing `<` or `>` (e.g. limit constraints or inequalities).
    - Math formulas contained within the question options were incorrectly generated as raw strings (e.g., `\frac{1}{5}`) instead of being wrapped in LaTeX delimiters (`$\frac{1}{5}$`). Because they weren't wrapped, KaTeX completely ignored them and rendered raw LaTeX code to the screen.

## What I fixed
1. **Implemented Deterministic Procedural Generation**: Completely rewrote the `generateQuestionsForTest` logic to create unique questions natively based on the `testId` and question index. Every single test now receives exactly 120 or 150 uniquely phrased questions without looping any arrays. 
2. **Introduced Section Support for GAT**:
    - Added an optional `section?: string` property to the `Question` interface.
    - Updated `mockData.ts` to logically group GAT questions 1-50 as "Section A: English" and questions 51-150 as "Section B: General Knowledge".
    - Updated `QuestionPalette.tsx` to automatically group and cluster the question navigation buttons by their respective section.
    - Added a sleek section header badge in the main test view (`page.tsx`) right above the active question.
3. **Fixed the LaTeX Renderer**:
    - Removed the destructive regex (`/<[^>]+>/g`) from the `cleanMath` pipeline to preserve limit syntax and valid inequalities.
    - Adjusted the math mock data generation to enforce standard `$` wrappers around all mathematically generated options.
4. **Data Integrity Script**: Created `test-data-integrity.ts` (and compiled it to `test-data-integrity.js`) that simulates mounting every single test to guarantee no duplicate IDs exist and to verify exact question counts per mock paper. 

## What's left to fix
1. **Database Integration for Real Data**: While the procedural mock generation creates flawless structural uniqueness (which is perfect for testing the UI components), the mathematical strings are placeholders. This needs to be hooked up to a real database (like Supabase) fetching 14,000+ actual NDA questions rather than memory-generating them on the fly.
2. **Dynamic Marking Weights**: Currently in `src/app/test/page.tsx`, the `positiveMarks` variable is hardcoded dynamically on the frontend (`test.subCategory === 'gat' ? 4.0 : 2.5`). A better practice would be calculating it purely from the data layer (`test.marks / test.questionsCount`), removing hardcoded logic from the frontend component.
3. **Robust Sanitization**: Because I removed the raw HTML regex stripper in `LatexRenderer` to save valid math expressions, you should theoretically implement a secure library like `DOMPurify` to safely strip harmful HTML if you ever plan to allow users/admins to freely inject raw LaTeX strings. 
