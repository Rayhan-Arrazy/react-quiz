# TriviaQuest

TriviaQuest is a dynamic, fully-featured trivia application built with React and TypeScript. It leverages the [Open Trivia Database (OpenTDB)](https://opentdb.com/) API to provide an endless supply of questions across various categories and difficulties.

## Features

- **User Login:** Simple username login system with session persistence.
- **Customizable Quizzes:** Choose the number of questions, specific categories, difficulty levels, and question types (multiple choice or true/false).
- **Time Limits:** Configurable timers to challenge your quick-thinking skills.
- **Session Recovery:** Automatically saves your active quiz progress in `localStorage`. If you accidentally close the browser, you can resume exactly where you left off.
- **Beautiful UI/UX:** A clean, vibrant light theme with responsive design, smooth transitions, and intuitive layouts.
- **Detailed Results:** A comprehensive dashboard showing your final score, detailed statistics (correct, incorrect, unanswered), and a question-by-question review.

## Tech Stack

- **Framework:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (using Radix UI primitives)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API:** [OpenTDB](https://opentdb.com/)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server address (usually `http://localhost:5173/` or `http://localhost:5174/`).

## Building for Production

To build the app for production, run:

```bash
npm run build
```

This will generate an optimized `dist` folder ready for deployment.

## Acknowledgements

- Questions provided by [OpenTDB](https://opentdb.com/).
