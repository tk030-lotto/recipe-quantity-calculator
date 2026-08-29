import { Ingredient } from "./types";

export function calculateScale(originalServings: number, targetServings: number): number {
  if (originalServings <= 0) return 1;
  return targetServings / originalServings;
}

export function scaleIngredient(ingredient: Ingredient, scale: number): Ingredient {
  if (!ingredient.isConvertible || ingredient.quantity === null) {
    return ingredient;
  }
  return {
    ...ingredient,
    quantity: ingredient.quantity * scale
  };
}

export function scaleRecipe(ingredients: Ingredient[], originalServings: number, targetServings: number): Ingredient[] {
  const scale = calculateScale(originalServings, targetServings);
  return ingredients.map(ing => scaleIngredient(ing, scale));
}
