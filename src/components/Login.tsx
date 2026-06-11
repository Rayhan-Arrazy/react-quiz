import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden">
        {/* Five-color glow indicator */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cpurple via-cpink to-caqua"></div>
        
        {/* Header */}
        <div className="text-center" style={{ padding: '48px 40px 24px 40px' }}>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            TriviaQuest
          </h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            Challenge your knowledge across dynamic trivia categories
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '8px 40px 24px 40px' }}>
            <div className="space-y-3 text-left">
              <Label htmlFor="username" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username..."
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus-visible:ring-cpurple/30 focus-visible:border-cpurple rounded-xl h-12 px-4 text-sm"
                autoComplete="off"
              />
              {error && <p className="text-cpink text-xs mt-1.5 font-medium">{error}</p>}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '0 40px 48px 40px' }}>
            <Button
              type="submit"
              id="login-submit-btn"
              className="w-full bg-gradient-to-r from-cpurple to-cpink hover:opacity-90 text-white font-semibold rounded-xl h-12 shadow-md shadow-cpurple/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
