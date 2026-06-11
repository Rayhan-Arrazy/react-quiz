import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, ArrowRight } from 'lucide-react';

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
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow indicator at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-violet-600 to-cyan-400 rounded-2xl flex items-center justify-content-center text-white shadow-lg shadow-violet-500/20 mb-4">
            <HelpCircle className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white font-heading">
            TriviaQuest
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            Challenge your knowledge across dynamic trivia categories
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2 pb-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="username" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
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
                className="bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500 rounded-xl h-11"
                autoComplete="off"
              />
              {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
            </div>
          </CardContent>

          <CardFooter className="pb-8">
            <Button
              type="submit"
              id="login-submit-btn"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl h-11 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
