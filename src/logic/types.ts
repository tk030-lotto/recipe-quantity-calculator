export interface Ingredient {
  id: string; // Reactのkey用
  originalText: string; // 元の行テキスト
  name: string; // 食材名
  quantity: number | null; // 分量（数値）
  unit: string; // 単位（g, ml, 大さじ, など）
  isConvertible: boolean; // 変換可能かどうか
}
