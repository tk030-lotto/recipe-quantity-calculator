import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { parseRecipe } from './logic/parser';
import { scaleRecipe } from './logic/calculator';
import { formatIngredient } from './logic/formatter';

function App() {
  const [recipeText, setRecipeText] = useState('');
  const [originalServings, setOriginalServings] = useState(2);
  const [targetServings, setTargetServings] = useState(3);

  // パースと計算をメモ化
  const results = useMemo(() => {
    const parsed = parseRecipe(recipeText);
    const scaled = scaleRecipe(parsed, originalServings, targetServings);
    return scaled.map(ing => ({
      id: ing.id,
      originalText: ing.originalText,
      formattedText: formatIngredient(ing),
      isConvertible: ing.isConvertible
    }));
  }, [recipeText, originalServings, targetServings]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl mx-auto shadow-lg border-orange-100">
        <CardHeader className="bg-orange-50 border-b border-orange-100/50 pb-6 rounded-t-xl">
          <CardTitle className="text-2xl font-bold text-orange-600 text-center flex items-center justify-center gap-2">
            🍳 CookScale
          </CardTitle>
          <CardDescription className="text-center text-orange-800/70 mt-2">
            レシピの分量を一発で再計算・計量しやすい形へ！
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="recipe" className="font-bold text-slate-700">レシピ（材料と分量）を貼り付け</Label>
            <Textarea
              id="recipe"
              placeholder={`鶏もも肉 300g\n醤油 大さじ2\nみりん 大さじ1\n塩 少々`}
              className="min-h-[160px] resize-y bg-white border-slate-200 focus:border-orange-300 focus:ring-orange-200"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="originalServings" className="text-slate-700">元の人数</Label>
              <div className="relative">
                <Input
                  id="originalServings"
                  type="number"
                  min="1"
                  className="pr-8 bg-white border-slate-200"
                  value={originalServings}
                  onChange={(e) => setOriginalServings(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-sm">人分</span>
              </div>
            </div>
            
            <div className="flex-none pt-6 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="targetServings" className="text-slate-700 font-bold text-orange-600">作りたい人数</Label>
              <div className="relative">
                <Input
                  id="targetServings"
                  type="number"
                  min="1"
                  className="pr-8 bg-orange-50 border-orange-200 font-bold text-orange-700 focus:border-orange-400 focus:ring-orange-300"
                  value={targetServings}
                  onChange={(e) => setTargetServings(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2.5 text-orange-500 text-sm font-bold">人分</span>
              </div>
            </div>
          </div>
        </CardContent>

        {results.length > 0 && (
          <div className="bg-slate-50 p-6 rounded-b-xl border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">✨</span>
              計算結果
            </h3>
            <ul className="space-y-3">
              {results.map((res) => (
                <li key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-orange-200">
                  <span className="text-slate-500 text-sm line-through sm:no-underline sm:line-through">{res.originalText}</span>
                  <span className="text-slate-900 font-bold text-lg mt-1 sm:mt-0 text-right">
                    {res.formattedText}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

export default App;
