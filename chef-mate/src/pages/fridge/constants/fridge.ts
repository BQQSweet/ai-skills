export const fridgeCategories = [
  "肉禽",
  "果蔬",
  "海鲜",
  "乳制品",
  "调味",
  "主食",
  "零食",
  "饮品",
  "其他",
] as const;

export const fridgeFilterCategories = ["全部", ...fridgeCategories] as const;

export const fridgeCategoryStyleMap: Record<
  (typeof fridgeCategories)[number],
  { bgClass: string; emoji: string }
> = {
  肉禽: { bgClass: "bg-orange-50", emoji: "🥩" },
  果蔬: { bgClass: "bg-green-50", emoji: "🥦" },
  海鲜: { bgClass: "bg-blue-50", emoji: "🐟" },
  乳制品: { bgClass: "bg-yellow-50", emoji: "🧀" },
  调味: { bgClass: "bg-amber-50", emoji: "🧂" },
  主食: { bgClass: "bg-orange-50", emoji: "🍚" },
  零食: { bgClass: "bg-pink-50", emoji: "🍪" },
  饮品: { bgClass: "bg-cyan-50", emoji: "🥤" },
  其他: { bgClass: "bg-slate-50", emoji: "📦" },
};
