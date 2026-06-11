import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import type { QuizConfig } from './components/Setup';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  shuffled_options: string[]; // Options mixed and shuffled
  selected_answer?: string;   // Saved user response
}

interface SavedQuizState {
  username: string;
  questions: Question[];
  currentIndex: number;
  timeLeft: number;
  config: QuizConfig;
}

// Shuffles an array using the Fisher-Yates algorithm
function shuffleArray(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function App() {
  // Authentication & Navigation Status
  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<'login' | 'setup' | 'quiz' | 'results'>('login');
  
  // Quiz active states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [timeRanOut, setTimeRanOut] = useState<boolean>(false);

  // App UI/UX utilities
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Resume Session overlay triggers
  const [savedSession, setSavedSession] = useState<SavedQuizState | null>(null);

  // 1. Initial mounting: check for logged in user and saved active quiz state
  useEffect(() => {
    const storedUser = localStorage.getItem('trivia_quiz_user');
    if (storedUser) {
      setUsername(storedUser);
      setStatus('setup');
    }

    const savedStateStr = localStorage.getItem('trivia_quiz_active_state');
    if (savedStateStr) {
      try {
        const parsedState: SavedQuizState = JSON.parse(savedStateStr);
        // Verify state is valid and has questions
        if (parsedState.username && parsedState.questions && parsedState.questions.length > 0 && parsedState.timeLeft > 0) {
          setSavedSession(parsedState);
        }
      } catch (e) {
        console.error('Failed to parse saved session state', e);
        localStorage.removeItem('trivia_quiz_active_state');
      }
    }
  }, []);

  // 2. Timer Countdown Effect
  useEffect(() => {
    if (status !== 'quiz') return;

    if (timeLeft <= 0) {
      handleQuizTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextVal = prev - 1;
        
        // Update local storage tick-by-tick to ensure accurate resume on browser crash
        if (config && username) {
          const activeState: SavedQuizState = {
            username,
            questions,
            currentIndex,
            timeLeft: nextVal,
            config
          };
          localStorage.setItem('trivia_quiz_active_state', JSON.stringify(activeState));
        }

        if (nextVal <= 0) {
          clearInterval(timer);
          handleQuizTimeout();
          return 0;
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLeft, currentIndex, questions, config, username]);

  const handleQuizTimeout = () => {
    setStatus('results');
    setTimeRanOut(true);
    localStorage.removeItem('trivia_quiz_active_state');
  };

  // 3. User actions
  const handleLogin = (name: string) => {
    setUsername(name);
    localStorage.setItem('trivia_quiz_user', name);
    setStatus('setup');
  };

  const handleLogout = () => {
    setUsername(null);
    setStatus('login');
    localStorage.removeItem('trivia_quiz_user');
    localStorage.removeItem('trivia_quiz_active_state');
    setSavedSession(null);
  };

  const handleStartQuiz = async (quizConfig: QuizConfig) => {
    setIsLoading(true);
    setFetchError(null);
    setTimeRanOut(false);
    
    // Construct OpenTDB API URL
    let url = `https://opentdb.com/api.php?amount=${quizConfig.amount}`;
    if (quizConfig.category) url += `&category=${quizConfig.category}`;
    if (quizConfig.difficulty) url += `&difficulty=${quizConfig.difficulty}`;
    if (quizConfig.type) url += `&type=${quizConfig.type}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.response_code === 0 && data.results && data.results.length > 0) {
        // Map and prepare questions by mixing and shuffling answers
        const formattedQuestions: Question[] = data.results.map((q: any) => {
          const options = [q.correct_answer, ...q.incorrect_answers];
          const shuffled = shuffleArray(options);
          return {
            category: q.category,
            type: q.type,
            difficulty: q.difficulty,
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
            shuffled_options: shuffled
          };
        });

        setQuestions(formattedQuestions);
        setCurrentIndex(0);
        setTimeLeft(quizConfig.timeLimit);
        setConfig(quizConfig);
        setStatus('quiz');

        // Save active state to localStorage
        if (username) {
          const activeState: SavedQuizState = {
            username,
            questions: formattedQuestions,
            currentIndex: 0,
            timeLeft: quizConfig.timeLimit,
            config: quizConfig
          };
          localStorage.setItem('trivia_quiz_active_state', JSON.stringify(activeState));
        }
      } else if (data.response_code === 5) {
        // OpenTDB Rate Limit code
        setFetchError('Too many requests. Please wait a few seconds and try again.');
      } else {
        setFetchError('Not enough questions available for this combination. Try reducing the question count or choosing different options.');
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
      setFetchError('Network error. Failed to retrieve questions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    // 1. Update the answer in state
    const updatedQuestions = questions.map((q, idx) => {
      if (idx === currentIndex) {
        return { ...q, selected_answer: answer };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);

    // 2. Compute the next index
    const nextIndex = currentIndex + 1;
    const isCompleted = nextIndex >= questions.length;

    if (config && username) {
      if (isCompleted) {
        // Quiz is finished! Go to results & clear active session storage
        setStatus('results');
        localStorage.removeItem('trivia_quiz_active_state');
      } else {
        // Save intermediate state
        const activeState: SavedQuizState = {
          username,
          questions: updatedQuestions,
          currentIndex: nextIndex,
          timeLeft,
          config
        };
        localStorage.setItem('trivia_quiz_active_state', JSON.stringify(activeState));
        
        // Auto-advance after a very short graphical delay (300ms) for high-end feel
        setTimeout(() => {
          setCurrentIndex(nextIndex);
        }, 300);
      }
    }
  };

  const handleResumeSession = () => {
    if (savedSession) {
      setUsername(savedSession.username);
      setQuestions(savedSession.questions);
      setCurrentIndex(savedSession.currentIndex);
      setTimeLeft(savedSession.timeLeft);
      setConfig(savedSession.config);
      setStatus('quiz');
      setSavedSession(null);
      
      // Update logged in user state
      localStorage.setItem('trivia_quiz_user', savedSession.username);
    }
  };

  const handleDiscardSession = () => {
    localStorage.removeItem('trivia_quiz_active_state');
    setSavedSession(null);
    if (!username) {
      setStatus('login');
    }
  };

  const handleRestartQuiz = () => {
    setStatus('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setTimeLeft(0);
    setConfig(null);
    setTimeRanOut(false);
  };

  return (
    <div className="app-container">
      
      {/* Background graphic elements */}
      <div className="bg-gradient-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <header className="app-main-header">
        <div className="header-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h1>TriviaQuest</h1>
        </div>
      </header>

      <main className="app-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loader-box">
              <div className="spinner"></div>
              <p>Fetching your questions from OpenTDB...</p>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="error-banner fade-in">
            <div className="error-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{fetchError}</span>
            </div>
            <button onClick={() => setFetchError(null)} className="error-close-btn">&times;</button>
          </div>
        )}

        {/* Saved Session Resume Modal using Shadcn Dialog */}
        <Dialog open={!!savedSession} onOpenChange={() => {}}>
          <DialogContent className="border-slate-800 bg-slate-900/95 text-white max-w-md rounded-2xl">
            <DialogHeader className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold font-heading text-white">Unfinished Quiz Found!</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm text-center mt-2 leading-relaxed">
                Hello <strong>{savedSession?.username}</strong>, we found an unfinished active quiz. You have <strong>{savedSession ? savedSession.questions.length - savedSession.currentIndex : 0}</strong> questions left and <strong>{savedSession ? Math.floor(savedSession.timeLeft / 60) : 0}m {savedSession ? savedSession.timeLeft % 60 : 0}s</strong> remaining on the timer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-row gap-3 w-full">
              <Button variant="secondary" onClick={handleDiscardSession} className="flex-1 bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl h-11 text-xs">
                Discard & Start New
              </Button>
              <Button onClick={handleResumeSession} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl h-11 text-xs shadow-lg shadow-violet-500/20">
                Resume Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Core screens routes */}
        {status === 'login' && !savedSession && (
          <Login onLogin={handleLogin} />
        )}

        {status === 'setup' && !savedSession && username && (
          <Setup
            username={username}
            onStart={handleStartQuiz}
            onLogout={handleLogout}
          />
        )}

        {status === 'quiz' && !savedSession && username && (
          <Quiz
            questions={questions}
            currentIndex={currentIndex}
            onSelectAnswer={handleSelectAnswer}
            timeLeft={timeLeft}
            username={username}
          />
        )}

        {status === 'results' && !savedSession && username && (
          <Results
            questions={questions}
            username={username}
            onRestart={handleRestartQuiz}
            timeRanOut={timeRanOut}
          />
        )}
      </main>

      <footer className="app-main-footer-bottom">
        <p>&copy; 2026 TriviaQuest. Powered by OpenTDB. Developed with premium React tech.</p>
      </footer>
    </div>
  );
}
