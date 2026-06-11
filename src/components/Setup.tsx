import React, { useState, useEffect } from 'react';

export interface QuizConfig {
  amount: number;
  category: string;
  categoryName: string;
  difficulty: string;
  type: string;
  timeLimit: number; // in seconds
}

interface SetupProps {
  username: string;
  onStart: (config: QuizConfig) => void;
  onLogout: () => void;
}

interface Category {
  id: number;
  name: string;
}

export const Setup: React.FC<SetupProps> = ({ username, onStart, onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quiz configuration states
  const [amount, setAmount] = useState(10);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [timeLimit, setTimeLimit] = useState(120); // default 2 minutes (120 seconds)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        if (data.trivia_categories) {
          setCategories(data.trivia_categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories, using fallback values.', err);
        // Fallback common categories in case API fails or rate limits
        setCategories([
          { id: 9, name: 'General Knowledge' },
          { id: 11, name: 'Entertainment: Film' },
          { id: 12, name: 'Entertainment: Music' },
          { id: 15, name: 'Entertainment: Video Games' },
          { id: 17, name: 'Science & Nature' },
          { id: 18, name: 'Science: Computers' },
          { id: 21, name: 'Sports' },
          { id: 22, name: 'Geography' },
          { id: 23, name: 'History' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCat = categories.find(c => c.id.toString() === category);
    const categoryName = selectedCat ? selectedCat.name : 'Any Category';

    onStart({
      amount: Math.max(1, Math.min(50, amount)), // clamp between 1 and 50 to avoid API rejection
      category,
      categoryName,
      difficulty,
      type,
      timeLimit: Math.max(10, timeLimit), // minimum 10 seconds
    });
  };

  return (
    <div className="card-container fade-in">
      <div className="setup-card">
        <div className="setup-header">
          <div className="user-greeting">
            <div className="avatar">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3>Welcome back, {username}!</h3>
              <p>Configure your quiz rules below.</p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-icon-text text-danger" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-grid">
            {/* Number of Questions */}
            <div className="input-group">
              <label htmlFor="amount">Number of Questions (1 - 50)</label>
              <div className="range-container">
                <input
                  type="range"
                  id="amount-slider"
                  min="5"
                  max="50"
                  step="5"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                />
                <input
                  type="number"
                  id="amount"
                  min="1"
                  max="50"
                  value={amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAmount(isNaN(val) ? 10 : val);
                  }}
                  className="number-input"
                />
              </div>
            </div>

            {/* Time Limit */}
            <div className="input-group">
              <label htmlFor="timeLimit">Time Limit (seconds)</label>
              <div className="range-container">
                <input
                  type="range"
                  id="timeLimit-slider"
                  min="30"
                  max="600"
                  step="30"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                />
                <input
                  type="number"
                  id="timeLimit"
                  min="10"
                  max="3600"
                  value={timeLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTimeLimit(isNaN(val) ? 120 : val);
                  }}
                  className="number-input"
                />
              </div>
              <span className="helper-text">
                ({Math.floor(timeLimit / 60)}m {timeLimit % 60}s)
              </span>
            </div>

            {/* Category */}
            <div className="input-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="">Any Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="input-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div className="input-group full-width">
              <label htmlFor="type">Question Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Any Type</option>
                <option value="multiple">Multiple Choice</option>
                <option value="boolean">True / False</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? (
              <span className="spinner-loader">Loading categories...</span>
            ) : (
              <>
                <span>Start Quiz</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
