import type { Ingredient } from "./types";

export function formatIngredient(ingredient: Ingredient): string {
  if (!ingredient.isConvertible || ingredient.quantity === null) {
    // 変換不可の場合は元の表現を保持
    return ingredient.originalText;
  }

  const { quantity, unit, name } = ingredient;

  if (unit === "大さじ" || unit === "小さじ") {
    let totalTsp = unit === "大さじ" ? quantity * 3 : quantity;
    totalTsp = Math.round(totalTsp * 100) / 100; // 誤差吸収

    let tbsp = Math.floor(totalTsp / 3);
    let tsp = Math.round((totalTsp % 3) * 10) / 10;

    // 丸めによる繰り上がり処理 (例: 2.96 -> tsp が 3.0 になった場合)
    if (tsp >= 3) {
      tbsp += Math.floor(tsp / 3);
      tsp = Math.round((tsp % 3) * 10) / 10;
    }

    let parts = [];
    if (tbsp > 0) parts.push(`大さじ${tbsp}`);
    if (tsp > 0) parts.push(`小さじ${tsp}`);

    const formattedUnit = parts.length > 0 ? parts.join("＋") : "少々";
    return `${name} ${formattedUnit}`;
  }


  // 小数第1位までに丸める
  const rounded = Math.round(quantity * 10) / 10;
  
  return `${name} ${rounded}${unit}`.trim();
}

