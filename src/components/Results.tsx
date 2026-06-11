import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, AlertCircle, FileText, Trophy, Clock } from 'lucide-react';

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
  
  const answeredQuestions = questions.filter(q => q.selected_answer !== undefined);
  const totalAnswered = answeredQuestions.length;
  const correctAnswers = questions.filter(
    q => q.selected_answer !== undefined && q.selected_answer === q.correct_answer
  ).length;
  const incorrectAnswers = totalAnswered - correctAnswers;
  const unansweredAnswers = totalQuestions - totalAnswered;
  
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  let feedbackMessage = 'Keep learning!';
  let feedbackColor = 'text-[#c9a800]';
  if (scorePercentage >= 80) {
    feedbackMessage = 'Excellent! You are a Trivia Master!';
    feedbackColor = 'text-[#00896b]';
  } else if (scorePercentage >= 50) {
    feedbackMessage = 'Good job! Nice effort!';
    feedbackColor = 'text-cblue';
  } else if (timeRanOut && totalAnswered === 0) {
    feedbackMessage = "Time ran out before you could start!";
    feedbackColor = 'text-cpink';
  } else if (timeRanOut) {
    feedbackMessage = 'Time ran out! Try to answer faster next time.';
    feedbackColor = 'text-cpink';
  }

  const svgSize = 160;
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - scorePercentage / 100);

  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden">
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cpurple via-cpink to-caqua"></div>

        {/* Header */}
        <div className="text-center" style={{ padding: '48px 40px 24px 40px' }}>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            Quiz Completed!
          </h2>
          <p className="text-slate-500 text-sm mt-3">
            Here is how you performed, {username}
          </p>

          {timeRanOut && (
            <div className="mx-auto mt-5 inline-flex items-center gap-2 bg-cpink/8 border border-cpink/20 text-cpink px-4 py-2.5 rounded-xl text-sm font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Timer Ran Out!</span>
            </div>
          )}
        </div>

        {/* Dashboard + Stats */}
        <div className="text-left" style={{ padding: '16px 40px 40px 40px' }}>
          
          {/* Score + Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 items-center border-b border-slate-100" style={{ gap: '40px', paddingBottom: '40px', marginBottom: '40px' }}>
            
            {/* Circular Score Gauge */}
            <div className="md:col-span-2 flex flex-col items-center" style={{ gap: '20px' }}>
              <div className="relative" style={{ width: svgSize, height: svgSize }}>
                <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                  <circle
                    cx={svgSize / 2}
                    cy={svgSize / 2}
                    r={radius}
                    className="fill-none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                  />
                  <circle
                    cx={svgSize / 2}
                    cy={svgSize / 2}
                    r={radius}
                    className="fill-none stroke-linecap-round transition-all duration-1000 ease-out"
                    stroke="#9b5de5"
                    strokeWidth="8"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: dashOffset,
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 font-heading leading-none">
                    {scorePercentage}%
                  </span>
                  <span className="text-xs text-slate-500 font-semibold mt-1">
                    {correctAnswers} / {totalQuestions}
                  </span>
                </div>
              </div>
              <h3 className={`text-base font-bold font-heading text-center ${feedbackColor}`}>
                {feedbackMessage}
              </h3>
            </div>

            {/* Stats Panel */}
            <div className="md:col-span-3 grid grid-cols-2" style={{ gap: '16px' }}>
              
              {/* Correct */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl flex items-center" style={{ padding: '20px', gap: '16px' }}>
                <div className="w-11 h-11 rounded-lg bg-caqua/10 text-[#00896b] flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">{correctAnswers}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Correct</p>
                </div>
              </div>

              {/* Incorrect */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl flex items-center" style={{ padding: '20px', gap: '16px' }}>
                <div className="w-11 h-11 rounded-lg bg-cpink/8 text-cpink flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">{incorrectAnswers}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Incorrect</p>
                </div>
              </div>

              {/* Unanswered */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl flex items-center" style={{ padding: '20px', gap: '16px' }}>
                <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">{unansweredAnswers}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Unanswered</p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl flex items-center" style={{ padding: '20px', gap: '16px' }}>
                <div className="w-11 h-11 rounded-lg bg-cblue/10 text-cblue flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">{totalQuestions}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Total</p>
                </div>
              </div>

            </div>
          </div>

          {/* Review Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-cpurple" />
              <span>Question Review</span>
            </h3>

            {/* Scrollable list */}
            <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, idx) => {
                const isCorrect = q.selected_answer !== undefined && q.selected_answer === q.correct_answer;
                const isUnanswered = q.selected_answer === undefined;
                
                let cardBorder = '';
                let statusBadge = null;

                if (isUnanswered) {
                  cardBorder = 'border-l-4 border-l-slate-300 bg-slate-50/50';
                  statusBadge = (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3" />
                    </span>
                  );
                } else if (isCorrect) {
                  cardBorder = 'border-l-4 border-l-caqua bg-caqua/5';
                  statusBadge = (
                    <span className="w-6 h-6 rounded-full bg-caqua text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  );
                } else {
                  cardBorder = 'border-l-4 border-l-cpink bg-cpink/5';
                  statusBadge = (
                    <span className="w-6 h-6 rounded-full bg-cpink text-white flex items-center justify-center shrink-0">
                      <X className="w-3 h-3" strokeWidth={3} />
                    </span>
                  );
                }

                return (
                  <div key={idx} className={`border border-slate-100 rounded-xl transition-all ${cardBorder}`} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {statusBadge}
                        <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 uppercase tracking-wider">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {decodeHtml(q.question)}
                    </p>

                    <div className="bg-slate-50 rounded-lg text-xs" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] shrink-0">Your Answer:</span>
                        <span className={`font-bold text-right ${isCorrect ? 'text-[#00896b]' : isUnanswered ? 'text-slate-400 italic' : 'text-cpink'}`}>
                          {isUnanswered ? 'Unanswered (Out of Time)' : decodeHtml(q.selected_answer || '')}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex justify-between items-baseline gap-4 border-t border-slate-200 pt-2.5">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] shrink-0">Correct Answer:</span>
                          <span className="font-bold text-[#00896b] text-right">{decodeHtml(q.correct_answer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-100 flex justify-center" style={{ padding: '32px 40px 40px 40px' }}>
          <Button
            onClick={onRestart}
            className="w-full max-w-xs bg-gradient-to-r from-cpurple to-cpink hover:opacity-90 text-white font-semibold rounded-xl h-12 shadow-md shadow-cpurple/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px] gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
