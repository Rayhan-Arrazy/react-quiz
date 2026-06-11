import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';

interface QuizProps {
  questions: Question[];
  currentIndex: number;
  onSelectAnswer: (answer: string) => void;
  timeLeft: number;
  username: string;
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  currentIndex,
  onSelectAnswer,
  timeLeft,
  username
}) => {
  const currentQuestion = questions[currentIndex];
  
  if (!currentQuestion) {
    return <div className="card-container"><div className="card">Loading question...</div></div>;
  }

  const answeredCount = questions.filter(q => q.selected_answer !== undefined).length;
  const totalQuestions = questions.length;
  
  // Format timer text
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine timer warning level
  const timerClass = timeLeft < 15 ? 'timer-danger' : timeLeft < 30 ? 'timer-warning' : 'timer-normal';

  // Progress percentage
  const progressPercent = (currentIndex / totalQuestions) * 100;
  const answeredPercent = (answeredCount / totalQuestions) * 100;

  const handleOptionClick = (option: string) => {
    onSelectAnswer(option);
  };

  return (
    <div className="card-container fade-in">
      <div className="quiz-card">
        {/* Top Header Row with Timer & Progress */}
        <div className="quiz-header">
          <div className="quiz-user-info">
            <span className="user-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {username}
            </span>
          </div>

          <div className={`quiz-timer ${timerClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={timeLeft < 15 ? 'pulse' : ''}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Double progress bars: completion of screens (top) & answers count (bottom) */}
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} title="Current position" />
        </div>

        <div className="quiz-stats-summary">
          <span>Question <strong>{currentIndex + 1}</strong> of <strong>{totalQuestions}</strong></span>
          <span>Answered: <strong>{answeredCount}</strong> / <strong>{totalQuestions}</strong></span>
        </div>

        {/* Question Area */}
        <div className="question-area">
          <div className="badges-row">
            <span className="badge badge-category">{decodeHtml(currentQuestion.category)}</span>
            <span className={`badge badge-difficulty difficulty-${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="question-text">
            {decodeHtml(currentQuestion.question)}
          </h2>

          {/* Options Grid */}
          <div className="options-grid">
            {currentQuestion.shuffled_options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="option-button"
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-content">{decodeHtml(option)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info showing answer status */}
        <div className="quiz-footer">
          <div className="answer-progress-container">
            <span className="text-muted text-xs">Total answers provided: {answeredCount} ({Math.round(answeredPercent)}%)</span>
            <div className="answer-progress-track">
              <div className="answer-progress-fill" style={{ width: `${answeredPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
