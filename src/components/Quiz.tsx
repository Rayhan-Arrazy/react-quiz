import React from 'react';
import type { Question } from '../App';
import { decodeHtml } from '../utils/htmlDecoder';
import { Progress } from '@/components/ui/progress';
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
        <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl" style={{ padding: '40px' }}>
          Loading question...
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => q.selected_answer !== undefined).length;
  const totalQuestions = questions.length;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerClass = 
    timeLeft < 15 
      ? 'bg-cpink/8 text-cpink border-cpink/25' 
      : timeLeft < 30 
      ? 'bg-[#fff8e1] text-[#c9a800] border-[#e6c800]/25' 
      : 'bg-caqua/8 text-[#00a886] border-caqua/25';

  const progressPercent = (currentIndex / totalQuestions) * 100;
  const answeredPercent = (answeredCount / totalQuestions) * 100;

  const handleOptionClick = (option: string) => {
    onSelectAnswer(option);
  };

  const difficultyColor = 
    currentQuestion.difficulty === 'easy' 
      ? 'bg-caqua/15 text-[#00896b]' 
      : currentQuestion.difficulty === 'medium' 
      ? 'bg-cyellow/20 text-[#a08600]' 
      : 'bg-cpink/12 text-cpink';

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden">
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cpurple via-cpink to-caqua"></div>

        {/* Header: Username + Timer */}
        <div className="flex items-center justify-between" style={{ padding: '40px 40px 20px 40px' }}>
          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            {username}
          </span>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold font-heading ${timerClass}`}>
            <Timer className={`w-4 h-4 ${timeLeft < 15 ? 'animate-pulse' : ''}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 40px', marginBottom: '24px' }}>
          <Progress value={progressPercent} className="h-[6px] bg-slate-100" />
        </div>

        {/* Main content */}
        <div className="text-left" style={{ padding: '0 40px 32px 40px' }}>
          {/* Stats */}
          <div className="flex justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100" style={{ marginBottom: '28px', paddingBottom: '20px' }}>
            <span>Question <strong className="text-slate-900">{currentIndex + 1}</strong> of <strong className="text-slate-900">{totalQuestions}</strong></span>
            <span>Answered: <strong className="text-slate-900">{answeredCount}</strong> / <strong className="text-slate-900">{totalQuestions}</strong></span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3" style={{ marginBottom: '24px' }}>
            <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
              {decodeHtml(currentQuestion.category)}
            </span>
            <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider ${difficultyColor}`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-bold font-heading text-slate-900 leading-snug" style={{ marginBottom: '32px' }}>
            {decodeHtml(currentQuestion.question)}
          </h2>

          {/* Options */}
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {currentQuestion.shuffled_options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="w-full flex items-center bg-slate-50/80 border border-slate-200 hover:border-cpurple hover:bg-cpurple/5 text-slate-900 rounded-xl text-left cursor-pointer transition-all duration-200 hover:translate-x-[4px] group"
                  style={{ padding: '18px 20px', gap: '16px' }}
                >
                  <span className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs font-heading group-hover:bg-cpurple group-hover:border-cpurple group-hover:text-white transition-all duration-200 shrink-0">
                    {letter}
                  </span>
                  <span className="flex-1 text-slate-700 group-hover:text-slate-900 font-medium text-sm transition-all duration-200">
                    {decodeHtml(option)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 text-left" style={{ padding: '24px 40px 40px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="text-slate-500 text-xs font-semibold">
              Total answers provided: {answeredCount} ({Math.round(answeredPercent)}%)
            </span>
            <Progress value={answeredPercent} className="h-1.5 bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};
