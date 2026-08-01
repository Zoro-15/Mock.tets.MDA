# NDA Mock Test Platform

A modern, responsive, and high-performance exam simulation platform designed for National Defence Academy (NDA) aspirants.

## 🚀 Features

- **Realistic Exam Interface**: Experience a layout inspired by Testbook with active countdown timer alerts and right-side question palette drawers.
- **Three Core Mock Categories**:
  - **Previous Year Papers**: 42 Official GAT & Mathematics papers (2015-2025).
  - **Mathematics Super Pack**: 36 Topic-wise chapter and subject tests.
  - **Full Mock Tests**: 16 Full syllabus simulations.
- **Dynamic Question Builder**: Fully parses LaTeX math formulas, structured tables, and assertion-reason formats.
- **Local Progress Persistence**: Sessions auto-save dynamically in your browser's local storage, allowing you to resume interrupted tests.
- **Performance Evaluation Tab**:
  - Comprehensive scorecard metrics (score, percentile, accuracy, average response times).
  - Detailed solutions panel with correct/incorrect answer filters.
  - Static peer leaderboard rankings page.
- **Keyboard Navigation Shortcuts**:
  - `1` - `4` : Select answer options A to D
  - `N` : Save & Next
  - `M` : Mark for Review & Next
  - `C` : Clear Response
  - `P` : Toggle Question Palette drawer

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19 & TypeScript
- **Styling**: Tailwind CSS v4 (Custom dark tokens)
- **Math Rendering**: KaTeX

## ⚙️ Development

Start the development server locally:

```bash
npm install
npm run dev
```

Build the static Single Page Application (SPA) production build:

```bash
npm run build
```
