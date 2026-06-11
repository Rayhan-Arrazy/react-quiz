import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { User, Timer } from 'lucide-react';

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
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-slate-800 bg-slate-900/60 text-white p-8">
          Loading question...
        </Card>
      </div>
    );
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
  const timerClass = 
    timeLeft < 15 
      ? 'bg-red-500/10 text-red-400 border-red-500/30' 
      : timeLeft < 30 
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  // Progress percentage
  const progressPercent = (currentIndex / totalQuestions) * 100;
  const answeredPercent = (answeredCount / totalQuestions) * 100;

  const handleOptionClick = (option: string) => {
    onSelectAnswer(option);
  };

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top Glow bar indicating active quiz state */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

        {/* Top Header Row with Timer & Progress */}
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
          <div className="flex items-center">
            <span className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {username}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-sm font-bold font-heading ${timerClass}`}>
            <Timer className={`w-4 h-4 ${timeLeft < 15 ? 'animate-pulse' : ''}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </CardHeader>

        {/* Top progress bar (screens transition) */}
        <div className="px-8 mb-4">
          <Progress value={progressPercent} className="h-[6px] bg-slate-950" />
        </div>

        <CardContent className="px-8 pb-6 pt-2 text-left">
          {/* Question Stats Summary */}
          <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-6 border-b border-slate-800/80 pb-4">
            <span>Question <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{totalQuestions}</strong></span>
            <span>Answered: <strong className="text-white">{answeredCount}</strong> / <strong className="text-white">{totalQuestions}</strong></span>
          </div>

          {/* Category & Difficulty badges */}
          <div className="flex gap-2 mb-4">
            <span className="bg-slate-950/60 border border-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {decodeHtml(currentQuestion.category)}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider text-slate-950
              ${currentQuestion.difficulty === 'easy' ? 'bg-emerald-500' : currentQuestion.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-bold font-heading text-white leading-snug mb-8">
            {decodeHtml(currentQuestion.question)}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.shuffled_options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="w-full flex items-center gap-4 bg-slate-950/40 border border-slate-800/80 hover:border-violet-500 hover:bg-violet-950/10 text-white rounded-xl p-4 text-left cursor-pointer transition-all duration-200 hover:translate-x-[4px] group"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs font-heading group-hover:bg-violet-600 group-hover:border-violet-500 group-hover:text-white transition-all duration-200">
                    {letter}
                  </span>
                  <span className="flex-1 text-slate-200 group-hover:text-white font-medium text-sm transition-all duration-200">
                    {decodeHtml(option)}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>

        {/* Footer info showing answer status */}
        <CardFooter className="px-8 pb-8 pt-4 border-t border-slate-800/80 flex flex-col items-stretch text-left">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold">
              Total answers provided: {answeredCount} ({Math.round(answeredPercent)}%)
            </span>
            <Progress value={answeredPercent} className="h-1 bg-slate-950" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
