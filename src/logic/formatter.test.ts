import { describe, it, expect } from 'vitest';
import { formatIngredient } from './formatter';
import { parseIngredientLine } from './parser';
import { scaleIngredient } from './calculator';

describe('formatIngredient', () => {
  it('formats scaled weight and volume correctly', () => {
    const ing = parseIngredientLine('鶏もも肉 300g');
    const scaled = scaleIngredient(ing, 1.5);
    expect(formatIngredient(scaled)).toBe('鶏もも肉 450g');
  });

  it('formats tablespoons and teaspoons (tbsp * 1.5)', () => {
    const ing = parseIngredientLine('醤油 大さじ2');
    const scaled = scaleIngredient(ing, 1.5); // 大さじ3
    expect(formatIngredient(scaled)).toBe('醤油 大さじ3');
  });

  it('formats tablespoons and teaspoons with remainders', () => {
    const ing = parseIngredientLine('みりん 大さじ1');
    const scaled = scaleIngredient(ing, 1.5); // 大さじ1.5 -> 大さじ1＋小さじ1.5
    expect(formatIngredient(scaled)).toBe('みりん 大さじ1＋小さじ1.5');
  });

  it('formats teaspoons exceeding 3 to tablespoons', () => {
    const ing = parseIngredientLine('砂糖 小さじ4');
    // そのままでも大さじ1＋小さじ1になるか
    expect(formatIngredient(ing)).toBe('砂糖 大さじ1＋小さじ1');
  });

  it('retains non-convertible expressions', () => {
    const ing = parseIngredientLine('塩 少々');
    const scaled = scaleIngredient(ing, 2);
    expect(formatIngredient(scaled)).toBe('塩 少々');
  });
});
