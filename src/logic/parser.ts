import type { Ingredient } from "./types";

function parseNumericValue(valueStr: string): number | null {
  if (!valueStr) return null;
  if (valueStr.includes('/')) {
    const parts = valueStr.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  const parsed = parseFloat(valueStr);
  return isNaN(parsed) ? null : parsed;
}

export function parseIngredientLine(line: string): Ingredient {
  const normalized = line
    .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ')
    .replace(/／/g, '/')
    .replace(/．/g, '.')
    .trim();

  const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2);
  
  if (!normalized) {
    return { id, originalText: "", name: "", quantity: null, unit: "", isConvertible: false };
  }

  // 数値化しない表現
  const nonConvertibles = ["少々", "適量", "お好みで", "適宜", "ひとつまみ"];
  for (const nc of nonConvertibles) {
    if (normalized.includes(nc)) {
      let name = normalized.replace(nc, "").trim();
      name = name.replace(/\s+/g, " ");
      return {
        id,
        originalText: normalized,
        name,
        quantity: null,
        unit: nc,
        isConvertible: false
      };
    }
  }

  // パターン1: 大さじ2, 小さじ1.5, 大さじ1/2
  let match = normalized.match(/^(.*?)\s*(大さじ|小さじ|大匙|小匙)\s*([0-9]+\/[0-9]+|[0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (match) {
    let unit = match[2];
    if (unit === "大匙") unit = "大さじ";
    if (unit === "小匙") unit = "小さじ";
    const quantity = parseNumericValue(match[3]);
    if (quantity !== null) {
      return {
        id,
        originalText: normalized,
        name: (match[1] + " " + match[4]).trim(),
        quantity,
        unit,
        isConvertible: true
      };
    }
  }

  // パターン2: 300g, 200ml, 1/2カップ, 200 cc
  match = normalized.match(/^(.*?)\s*([0-9]+\/[0-9]+|[0-9]+(?:\.[0-9]+)?)\s*(g|ml|cc|カップ|kg|l|L)(.*)$/i);
  if (match) {
    const quantity = parseNumericValue(match[2]);
    if (quantity !== null) {
      return {
        id,
        originalText: normalized,
        name: (match[1] + " " + match[4]).trim(),
        quantity,
        unit: match[3],
        isConvertible: true
      };
    }
  }
  
  // パターン3: 数字のみ (例: 卵 2 個, 玉ねぎ 1/2 個)
  match = normalized.match(/^(.*?)\s*([0-9]+\/[0-9]+|[0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
  if (match) {
    const quantity = parseNumericValue(match[2]);
    if (quantity !== null) {
      return {
        id,
        originalText: normalized,
        name: match[1].trim(),
        quantity,
        unit: match[3].trim(),
        isConvertible: true
      };
    }
  }

  // どれにもマッチしない場合はそのまま
  return {
    id,
    originalText: normalized,
    name: normalized,
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

