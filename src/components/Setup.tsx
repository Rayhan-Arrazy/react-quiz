import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  // Quiz configuration states
  const [amount, setAmount] = useState(10);
  const [category, setCategory] = useState('any');
  const [difficulty, setDifficulty] = useState('any');
  const [type, setType] = useState('any');
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
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow indicator at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-6 pt-8 px-8">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-400 flex items-center justify-center font-extrabold text-sm shadow-md shadow-cyan-500/10">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white font-heading">
                Welcome back, {username}!
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Configure your game settings below
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={onLogout} 
            id="logout-btn"
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-9 px-3 gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold">Logout</span>
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Number of Questions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount-slider" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Number of Questions
                  </Label>
                  <span className="text-cyan-400 font-bold font-heading text-sm">{amount}</span>
                </div>
                <div className="flex items-center gap-4 py-2">
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
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="timeLimit-slider" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Time Limit
                  </Label>
                  <span className="text-violet-400 font-bold font-heading text-sm">
                    {Math.floor(timeLimit / 60)}m {timeLimit % 60}s
                  </span>
                </div>
                <div className="flex items-center gap-4 py-2">
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
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={loading}>
                  <SelectTrigger id="category" className="bg-slate-950/80 border-slate-800 text-white rounded-xl h-11 focus:ring-violet-500 focus:border-violet-500">
                    <SelectValue placeholder="Any Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-xl">
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
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="bg-slate-950/80 border-slate-800 text-white rounded-xl h-11 focus:ring-violet-500 focus:border-violet-500">
                    <SelectValue placeholder="Any Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectItem value="any">Any Difficulty</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="type" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Question Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="bg-slate-950/80 border-slate-800 text-white rounded-xl h-11 focus:ring-violet-500 focus:border-violet-500">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="boolean">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8">
            <Button
              type="submit"
              id="start-quiz-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl h-12 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
