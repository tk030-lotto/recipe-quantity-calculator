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

  it('rounds decimal values to 1 decimal place', () => {
    const ing = parseIngredientLine('玉ねぎ 1個');
    const scaled = scaleIngredient(ing, 1.333);
    expect(formatIngredient(scaled)).toBe('玉ねぎ 1.3個');
  });

  it('correctly carries over tsp to tbsp when rounded tsp is 3', () => {
    const ing = {
      id: 'test',
      originalText: '醤油 大さじ1',
      name: '醤油',
      quantity: 0.99, // totalTsp = 2.97 -> tsp = 3 -> tbsp 1
      unit: '大さじ',
      isConvertible: true
    };
    expect(formatIngredient(ing)).toBe('醤油 大さじ1');
  });
});


