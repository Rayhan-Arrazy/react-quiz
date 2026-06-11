import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogOut, Play } from 'lucide-react';

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
  
  const [amount, setAmount] = useState(10);
  const [category, setCategory] = useState('any');
  const [difficulty, setDifficulty] = useState('any');
  const [type, setType] = useState('any');
  const [timeLimit, setTimeLimit] = useState(120);

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
      amount,
      category: category === 'any' ? '' : category,
      categoryName,
      difficulty: difficulty === 'any' ? '' : difficulty,
      type: type === 'any' ? '' : type,
      timeLimit,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cpurple via-cpink to-caqua"></div>

        {/* Header with user + logout */}
        <div className="flex items-center justify-between border-b border-slate-100" style={{ padding: '32px 40px' }}>
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-cblue/10 border border-cblue/30 text-cblue flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Welcome back, {username}!
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Configure your game settings below
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout} 
            id="logout-btn"
            className="text-slate-400 hover:text-cpink hover:bg-cpink/5 rounded-lg h-9 px-3 gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold">Logout</span>
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="text-left" style={{ padding: '40px 40px 16px 40px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Number of Questions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount-slider" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    Number of Questions
                  </Label>
                  <span className="text-cblue font-bold font-heading text-sm bg-cblue/10 px-2.5 py-0.5 rounded-lg">{amount}</span>
                </div>
                <div className="py-1">
                  <Slider
                    id="amount-slider"
                    min={5}
                    max={50}
                    step={5}
                    value={[amount]}
                    onValueChange={(val: number[]) => setAmount(val[0])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="timeLimit-slider" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    Time Limit
                  </Label>
                  <span className="text-cpurple font-bold font-heading text-sm bg-cpurple/10 px-2.5 py-0.5 rounded-lg">
                    {Math.floor(timeLimit / 60)}m {timeLimit % 60}s
                  </span>
                </div>
                <div className="py-1">
                  <Slider
                    id="timeLimit-slider"
                    min={30}
                    max={600}
                    step={30}
                    value={[timeLimit]}
                    onValueChange={(val: number[]) => setTimeLimit(val[0])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={loading}>
                  <SelectTrigger id="category" className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12 focus:ring-cpurple/30 focus:border-cpurple">
                    <SelectValue placeholder="Any Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-lg">
                    <SelectItem value="any">Any Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label htmlFor="difficulty" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12 focus:ring-cpurple/30 focus:border-cpurple">
                    <SelectValue placeholder="Any Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-lg">
                    <SelectItem value="any">Any Difficulty</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="type" className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  Question Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12 focus:ring-cpurple/30 focus:border-cpurple">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-lg">
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="boolean">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* Start button */}
          <div style={{ padding: '16px 40px 40px 40px' }}>
            <Button
              type="submit"
              id="start-quiz-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cpurple to-cpink hover:opacity-90 text-white font-semibold rounded-xl shadow-md shadow-cpurple/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
              style={{ height: '52px' }}
            >
              {loading ? (
                <span>Loading categories...</span>
              ) : (
                <>
                  <span>Start Quiz</span>
                  <Play className="w-4 h-4 ml-2 fill-white" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
