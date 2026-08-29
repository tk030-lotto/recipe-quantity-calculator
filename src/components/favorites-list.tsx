import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { Label } from './ui/label';

export interface FavoriteRecipe {
  id: string;
  title: string;
  recipeText: string;
  originalServings: number;
  targetServings: number;
}

interface FavoritesListProps {
  favorites: FavoriteRecipe[];
  onSelect: (recipe: FavoriteRecipe) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onSelect,
  onDelete,
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Bookmark className="w-3.5 h-3.5 text-orange-500" />
        保存したお気に入りレシピ
      </Label>
      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            onClick={() => onSelect(fav)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/70 hover:bg-orange-200/80 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-900 dark:text-orange-200 text-xs rounded-full cursor-pointer transition-colors border border-orange-200/60 dark:border-orange-800/60 shadow-xs"
          >
            <span>{fav.title}</span>
            <button
              type="button"
              onClick={(e) => onDelete(fav.id, e)}
              className="text-orange-500 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded-full"
              title="削除"
              aria-label={`お気に入り「${fav.title}」を削除`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
