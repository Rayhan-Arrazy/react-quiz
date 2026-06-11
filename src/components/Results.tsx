import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';

interface ResultsProps {
  questions: Question[];
  username: string;
  onRestart: () => void;
  timeRanOut: boolean;
}

export const Results: React.FC<ResultsProps> = ({
  questions,
  username,
  onRestart,
  timeRanOut
}) => {
  const totalQuestions = questions.length;
  
  // Calculate results
  const answeredQuestions = questions.filter(q => q.selected_answer !== undefined);
  const totalAnswered = answeredQuestions.length;
  const correctAnswers = questions.filter(
    q => q.selected_answer !== undefined && q.selected_answer === q.correct_answer
  ).length;
  const incorrectAnswers = totalAnswered - correctAnswers;
  const unansweredAnswers = totalQuestions - totalAnswered;
  
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Performance feedback message
  let feedbackMessage = 'Keep learning!';
  let feedbackColor = 'text-warning';
  if (scorePercentage >= 80) {
    feedbackMessage = 'Excellent! You are a Trivia Master!';
    feedbackColor = 'text-success';
  } else if (scorePercentage >= 50) {
    feedbackMessage = 'Good job! Nice effort!';
    feedbackColor = 'text-info';
  } else if (timeRanOut && totalAnswered === 0) {
    feedbackMessage = "Time ran out before you could start!";
    feedbackColor = 'text-danger';
  } else if (timeRanOut) {
    feedbackMessage = 'Time ran out! Try to answer faster next time.';
    feedbackColor = 'text-danger';
  }

  return (
    <div className="card-container fade-in">
      <div className="results-card">
        
        {/* Results Header */}
        <div className="results-header">
          <h2>Quiz Completed!</h2>
          <p className="subtitle">Here is how you performed, {username}</p>
          {timeRanOut && (
            <div className="alert-badge warning-alert pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Timer Ran Out!</span>
            </div>
          )}
        </div>

        {/* Dashboard Layout */}
        <div className="dashboard-grid">
          {/* Circular Score Gauge */}
          <div className="gauge-panel">
            <div className="score-ring">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="score-ring-bg"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="score-ring-fill"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 70}`,
                    strokeDashoffset: `${2 * Math.PI * 70 * (1 - scorePercentage / 100)}`
                  }}
                />
              </svg>
              <div className="score-value-container">
                <span className="score-percent">{scorePercentage}%</span>
                <span className="score-fraction">{correctAnswers} / {totalQuestions}</span>
              </div>
            </div>
            <h3 className={`feedback-text ${feedbackColor}`}>{feedbackMessage}</h3>
          </div>

          {/* Stats Cards */}
          <div className="stats-panel">
            <div className="stat-card stat-correct">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{correctAnswers}</span>
                <span className="stat-label">Correct Answers</span>
              </div>
            </div>

            <div className="stat-card stat-incorrect">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{incorrectAnswers}</span>
                <span className="stat-label">Incorrect Answers</span>
              </div>
            </div>

            <div className="stat-card stat-unanswered">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{unansweredAnswers}</span>
                <span className="stat-label">Unanswered</span>
              </div>
            </div>

            <div className="stat-card stat-total">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalQuestions}</span>
                <span className="stat-label">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="review-section">
          <h3>Question Review</h3>
          <div className="review-list">
            {questions.map((q, idx) => {
              const isCorrect = q.selected_answer !== undefined && q.selected_answer === q.correct_answer;
              const isUnanswered = q.selected_answer === undefined;
              
              let statusClass = 'review-card-correct';
              let icon = (
                <span className="review-badge-icon badge-correct">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              );

              if (isUnanswered) {
                statusClass = 'review-card-unanswered';
                icon = (
                  <span className="review-badge-icon badge-unanswered">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </span>
                );
              } else if (!isCorrect) {
                statusClass = 'review-card-incorrect';
                icon = (
                  <span className="review-badge-icon badge-incorrect">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                );
              }

              return (
                <div key={idx} className={`review-card ${statusClass}`}>
                  <div className="review-card-header">
                    <div className="review-q-num">
                      {icon}
                      <span>Question {idx + 1}</span>
                    </div>
                    <span className="badge badge-difficulty-xs">{q.difficulty}</span>
                  </div>

                  <p className="review-question-text">{decodeHtml(q.question)}</p>

                  <div className="review-answers-box">
                    <div className="review-answer-row">
                      <span className="answer-row-label">Your Answer:</span>
                      <span className={`answer-row-value ${isCorrect ? 'text-success fw-bold' : isUnanswered ? 'text-muted italic' : 'text-danger fw-bold'}`}>
                        {isUnanswered ? 'Unanswered (Out of Time)' : decodeHtml(q.selected_answer || '')}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div className="review-answer-row">
                        <span className="answer-row-label">Correct Answer:</span>
                        <span className="answer-row-value text-success fw-bold">
                          {decodeHtml(q.correct_answer)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="results-actions">
          <button onClick={onRestart} className="btn btn-primary btn-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Play Again</span>
          </button>
        </div>

      </div>
    </div>
  );
};
