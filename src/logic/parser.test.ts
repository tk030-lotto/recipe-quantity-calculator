import { describe, it, expect } from 'vitest';
import { parseIngredientLine } from './parser';

describe('parseIngredientLine', () => {
  it('parses weight and volume units', () => {
    expect(parseIngredientLine('鶏もも肉 300g')).toMatchObject({ name: '鶏もも肉', quantity: 300, unit: 'g', isConvertible: true });
    expect(parseIngredientLine('水 200ml')).toMatchObject({ name: '水', quantity: 200, unit: 'ml', isConvertible: true });
    expect(parseIngredientLine('牛乳 1.5カップ')).toMatchObject({ name: '牛乳', quantity: 1.5, unit: 'カップ', isConvertible: true });
  });

  it('parses tablespoons and teaspoons', () => {
    expect(parseIngredientLine('醤油 大さじ2')).toMatchObject({ name: '醤油', quantity: 2, unit: '大さじ', isConvertible: true });
    expect(parseIngredientLine('みりん 小さじ1.5')).toMatchObject({ name: 'みりん', quantity: 1.5, unit: '小さじ', isConvertible: true });
  });

  it('parses numbers without specific units', () => {
    expect(parseIngredientLine('卵 2個')).toMatchObject({ name: '卵', quantity: 2, unit: '個', isConvertible: true });
    expect(parseIngredientLine('にんにく 1 片')).toMatchObject({ name: 'にんにく', quantity: 1, unit: '片', isConvertible: true });
  });

  it('handles non-convertible expressions', () => {
    expect(parseIngredientLine('塩 少々')).toMatchObject({ name: '塩', quantity: null, unit: '少々', isConvertible: false });
    expect(parseIngredientLine('こしょう 適量')).toMatchObject({ name: 'こしょう', quantity: null, unit: '適量', isConvertible: false });
    expect(parseIngredientLine('パセリ お好みで')).toMatchObject({ name: 'パセリ', quantity: null, unit: 'お好みで', isConvertible: false });
  });

  it('handles empty or unrecognized lines', () => {
    expect(parseIngredientLine('')).toMatchObject({ isConvertible: false });
    expect(parseIngredientLine('豚肉')).toMatchObject({ isConvertible: false });
  });
});
