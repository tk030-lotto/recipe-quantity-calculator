import type { Ingredient } from "./types";

export function parseIngredientLine(line: string): Ingredient {
  const trimmed = line.trim();
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();
  
  if (!trimmed) {
    return { id, originalText: "", name: "", quantity: null, unit: "", isConvertible: false };
  }

  // 数値化しない表現
  const nonConvertibles = ["少々", "適量", "お好みで", "適宜", "ひとつまみ"];
  for (const nc of nonConvertibles) {
    if (trimmed.includes(nc)) {
      let name = trimmed.replace(nc, "").trim();
      // 余計な空白を取り除く
      name = name.replace(/\s+/g, " ");
      return {
        id,
        originalText: trimmed,
        name,
        quantity: null,
        unit: nc,
        isConvertible: false
      };
    }
  }

  // パターン1: 大さじ2, 小さじ1.5
  let match = trimmed.match(/^(.*?)\s*(大さじ|小さじ|大匙|小匙)\s*([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (match) {
    let unit = match[2];
    if (unit === "大匙") unit = "大さじ";
    if (unit === "小匙") unit = "小さじ";
    return {
      id,
      originalText: trimmed,
      name: (match[1] + " " + match[4]).trim(),
      quantity: parseFloat(match[3]),
      unit,
      isConvertible: true
    };
  }

  // パターン2: 300g, 200ml, 1.5カップ, 200 cc (数値と単位がくっついているかスペースがある)
  match = trimmed.match(/^(.*?)\s*([0-9]+(?:\.[0-9]+)?)\s*(g|ml|cc|カップ|kg|l|L)(.*)$/i);
  if (match) {
    return {
      id,
      originalText: trimmed,
      name: (match[1] + " " + match[4]).trim(),
      quantity: parseFloat(match[2]),
      unit: match[3],
      isConvertible: true
    };
  }
  
  // パターン3: 数字のみ (例: 卵 2 個)
  match = trimmed.match(/^(.*?)\s*([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
  if (match) {
    return {
      id,
      originalText: trimmed,
      name: match[1].trim(),
      quantity: parseFloat(match[2]),
      unit: match[3].trim(), // "個", "本" など
      isConvertible: true
    };
  }

  // どれにもマッチしない場合はそのまま
  return {
    id,
    originalText: trimmed,
    name: trimmed,
    quantity: null,
    unit: "",
    isConvertible: false
  };
}

export function parseRecipe(text: string): Ingredient[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(parseIngredientLine);
}
