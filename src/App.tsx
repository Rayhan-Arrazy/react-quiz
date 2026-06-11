import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import type { QuizConfig } from './components/Setup';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';

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

        {/* Saved Session Resume Modal */}
        {savedSession && (
          <div className="modal-backdrop">
            <div className="modal-content fade-in">
              <div className="modal-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h2>Unfinished Quiz Found!</h2>
              </div>
              <div className="modal-body">
                <p>Hello <strong>{savedSession.username}</strong>, we detected a quiz that was not finished. You had <strong>{savedSession.questions.length - savedSession.currentIndex}</strong> questions remaining out of <strong>{savedSession.questions.length}</strong>, with <strong>{Math.floor(savedSession.timeLeft / 60)}m {savedSession.timeLeft % 60}s</strong> left on the clock.</p>
                <p>Would you like to resume it now or start a new quiz?</p>
              </div>
              <div className="modal-footer">
                <button onClick={handleDiscardSession} className="btn btn-secondary">Discard & Start New</button>
                <button onClick={handleResumeSession} className="btn btn-primary">Resume Quiz</button>
              </div>
            </div>
          </div>
        )}

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
