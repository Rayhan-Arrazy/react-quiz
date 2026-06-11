import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  let feedbackColor = 'text-amber-400';
  if (scorePercentage >= 80) {
    feedbackMessage = 'Excellent! You are a Trivia Master!';
    feedbackColor = 'text-emerald-400';
  } else if (scorePercentage >= 50) {
    feedbackMessage = 'Good job! Nice effort!';
    feedbackColor = 'text-cyan-400';
  } else if (timeRanOut && totalAnswered === 0) {
    feedbackMessage = "Time ran out before you could start!";
    feedbackColor = 'text-red-400';
  } else if (timeRanOut) {
    feedbackMessage = 'Time ran out! Try to answer faster next time.';
    feedbackColor = 'text-red-400';
  }

  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top Glow bar indicating active quiz state */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

        {/* Results Header */}
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Quiz Completed!
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-2">
            Here is how you performed, {username}
          </CardDescription>

          {timeRanOut && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Timer Ran Out!</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-8 space-y-8 text-left">
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center border-b border-slate-800/80 pb-8">
            
            {/* Circular Score Gauge */}
            <div className="md:col-span-2 flex flex-col items-center gap-4">
              <div className="relative w-40 h-40">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="fill-none stroke-slate-950 stroke-[8px]"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="fill-none stroke-violet-500 stroke-[8px] stroke-linecap-round transition-all duration-1000 ease-out"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 70}`,
                      strokeDashoffset: `${2 * Math.PI * 70 * (1 - scorePercentage / 100)}`,
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                </svg>
                <div className="absolute top-50% left-50% translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                  <span className="text-3xl font-black text-white font-heading leading-none">
                    {scorePercentage}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold mt-1">
                    {correctAnswers} / {totalQuestions}
                  </span>
                </div>
              </div>
              <h3 className={`text-base font-bold font-heading text-center ${feedbackColor}`}>
                {feedbackMessage}
              </h3>
            </div>

            {/* Stats Panel */}
            <div className="md:col-span-3 grid grid-cols-2 gap-3">
              
              {/* Correct Answers */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{correctAnswers}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Correct</p>
                </div>
              </div>

              {/* Incorrect Answers */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{incorrectAnswers}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Incorrect</p>
                </div>
              </div>

              {/* Unanswered */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{unansweredAnswers}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Unanswered</p>
                </div>
              </div>

              {/* Total Questions */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{totalQuestions}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Total</p>
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Review Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-400" />
              <span>Question Review</span>
            </h3>

            {/* Scrollable list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {questions.map((q, idx) => {
                const isCorrect = q.selected_answer !== undefined && q.selected_answer === q.correct_answer;
                const isUnanswered = q.selected_answer === undefined;
                
                let cardBorder = '';
                let statusBadge = null;

                if (isUnanswered) {
                  cardBorder = 'border-l-4 border-l-slate-600 bg-slate-950/10';
                  statusBadge = (
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Clock className="w-3 h-3" />
                    </span>
                  );
                } else if (isCorrect) {
                  cardBorder = 'border-l-4 border-l-emerald-500 bg-emerald-500/5';
                  statusBadge = (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  );
                } else {
                  cardBorder = 'border-l-4 border-l-red-500 bg-red-500/5';
                  statusBadge = (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-slate-950 flex items-center justify-center">
                      <X className="w-3 h-3" strokeWidth={3} />
                    </span>
                  );
                }

                return (
                  <div key={idx} className={`border border-slate-800/80 rounded-xl p-4 space-y-3 transition-all ${cardBorder}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {statusBadge}
                        <span className="text-xs font-bold text-slate-200">Question {idx + 1}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-950/60 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {decodeHtml(q.question)}
                    </p>

                    <div className="bg-slate-950/50 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Your Answer:</span>
                        <span className={`font-bold ${isCorrect ? 'text-emerald-400' : isUnanswered ? 'text-slate-500 italic' : 'text-red-400'}`}>
                          {isUnanswered ? 'Unanswered (Out of Time)' : decodeHtml(q.selected_answer || '')}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex justify-between border-t border-slate-900 pt-1.5">
                          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Correct Answer:</span>
                          <span className="font-bold text-emerald-400">{decodeHtml(q.correct_answer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        {/* Action Button */}
        <div className="p-8 border-t border-slate-800/80 flex justify-center">
          <Button
            onClick={onRestart}
            className="w-full max-w-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl h-11 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px] gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </Button>
        </div>

      </Card>
    </div>
  );
};
