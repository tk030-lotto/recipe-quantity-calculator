import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { ModeToggle } from './components/mode-toggle';
import { FavoritesList, type FavoriteRecipe } from './components/favorites-list';
import { parseRecipe } from './logic/parser';
import { scaleRecipe } from './logic/calculator';
import { formatIngredient } from './logic/formatter';
import { Copy, Check, RotateCcw, BookmarkPlus, ArrowRight } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'cookscale_favorites_v1';

function App() {
  const [recipeText, setRecipeText] = useState('');
  const [originalServings, setOriginalServings] = useState<number | ''>(2);
  const [targetServings, setTargetServings] = useState<number | ''>(3);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage quota errors
    }
  }, [favorites]);

  const results = useMemo(() => {
    const orig = typeof originalServings === 'number' && originalServings > 0 ? originalServings : 1;
    const targ = typeof targetServings === 'number' && targetServings > 0 ? targetServings : 1;
    const parsed = parseRecipe(recipeText);
    const scaled = scaleRecipe(parsed, orig, targ);
    return scaled.map(ing => ({
      id: ing.id,
      originalText: ing.originalText,
      formattedText: formatIngredient(ing),
      isConvertible: ing.isConvertible
    }));
  }, [recipeText, originalServings, targetServings]);

  const handleCopy = async () => {
    if (results.length === 0) return;
    const textToCopy = results.map(r => r.formattedText).join('\n');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed
    }
  };

  const handleReset = () => {
    setRecipeText('');
    setOriginalServings(2);
    setTargetServings(3);
  };

  const handleSaveFavorite = () => {
    if (!recipeText.trim()) return;
    const firstLine = recipeText.trim().split('\n')[0] || '無題のレシピ';
    const title = window.prompt('レシピのタイトルを入力してください', firstLine.slice(0, 20)) || firstLine.slice(0, 20);
    if (!title.trim()) return;

    const newFav: FavoriteRecipe = {
      id: (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2),
      title: title.trim(),
      recipeText,
      originalServings: typeof originalServings === 'number' ? originalServings : 2,
      targetServings: typeof targetServings === 'number' ? targetServings : 3,
    };

    setFavorites(prev => [newFav, ...prev.filter(f => f.title !== newFav.title)].slice(0, 10));
  };

  const handleLoadFavorite = (fav: FavoriteRecipe) => {
    setRecipeText(fav.recipeText);
    setOriginalServings(fav.originalServings);
    setTargetServings(fav.targetServings);
  };

  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <Card className="w-full max-w-xl mx-auto shadow-lg border-orange-100 dark:border-orange-900/50 relative overflow-hidden">
        
        {/* ダークモードトグル */}
        <div className="absolute top-4 right-4 z-10">
          <ModeToggle />
        </div>

        <CardHeader className="bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100/50 dark:border-orange-900/50 pb-6 rounded-t-xl relative">
          <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400 text-center flex items-center justify-center gap-2 mt-4 sm:mt-0">
            🍳 CookScale
          </CardTitle>
          <CardDescription className="text-center text-orange-800/70 dark:text-orange-200/70 mt-2">
            レシピの分量を一発で再計算・計量しやすい形へ！
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* お気に入りリストコンポーネント */}
          <FavoritesList
            favorites={favorites}
            onSelect={handleLoadFavorite}
            onDelete={handleDeleteFavorite}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipe" className="font-bold text-slate-700 dark:text-slate-300">
                レシピ（材料と分量）を貼り付け
              </Label>
              <div className="flex items-center gap-2">
                {recipeText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveFavorite}
                    className="h-7 px-2 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-950/50"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                    お気に入り保存
                  </Button>
                )}
                {(recipeText || originalServings !== 2 || targetServings !== 3) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 px-2 text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    クリア
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              id="recipe"
              placeholder={`鶏もも肉 300g\n醤油 大さじ2\nみりん 大さじ1\n塩 少々`}
              className="min-h-[150px] resize-y bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-orange-300 dark:focus:border-orange-700 focus:ring-orange-200 dark:focus:ring-orange-900/50"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="originalServings" className="text-slate-700 dark:text-slate-300">元の人数</Label>
              <div className="relative">
                <Input
                  id="originalServings"
                  type="number"
                  min="1"
                  className="pr-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={originalServings}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOriginalServings(val === '' ? '' : Math.max(1, Number(val)));
                  }}
                />
                <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500 text-sm">人分</span>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-none pt-6 text-slate-400 dark:text-slate-600">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex sm:hidden justify-center text-slate-400 dark:text-slate-600 -my-2">
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="targetServings" className="text-slate-700 dark:text-slate-300 font-bold text-orange-600 dark:text-orange-400">作りたい人数</Label>
              <div className="relative">
                <Input
                  id="targetServings"
                  type="number"
                  min="1"
                  className="pr-8 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 font-bold text-orange-700 dark:text-orange-300 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-orange-300 dark:focus:ring-orange-900"
                  value={targetServings}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetServings(val === '' ? '' : Math.max(1, Number(val)));
                  }}
                />
                <span className="absolute right-3 top-2.5 text-orange-500 dark:text-orange-600 text-sm font-bold">人分</span>
              </div>
            </div>
          </div>
        </CardContent>

        {results.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-b-xl border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm">✨</span>
                計算結果
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">コピー完了</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    <span>結果をコピー</span>
                  </>
                )}
              </Button>
            </div>
            <ul className="space-y-3">
              {results.map((res) => (
                <li key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-orange-800">
                  <span className="text-slate-500 dark:text-slate-400 text-sm line-through sm:no-underline sm:line-through">{res.originalText}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-lg mt-1 sm:mt-0 text-right">
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


