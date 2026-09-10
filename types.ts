export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface PFCRatio {
  proteinPercent: number;
  fatPercent: number;
  carbPercent: number;
}

export interface MealRecord {
  id: string;
  userId?: string; // Associated user profile ID (e.g. 'user_a', 'user_b')
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  dishName: string;
  summary?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  salt?: number;
  pfcRatio: PFCRatio;
  foodItems: FoodItem[];
  dietScore?: number;
  dietAdvice?: string;
  lineReplyDraft?: string; // LINE返信メッセージ文案
  imageUrl?: string;
  createdAt: number;
}

export type LineToneType = "supportive" | "positive" | "concise" | "logical";

export type DietMode = "balanced" | "high-protein" | "low-carb" | "custom";

export type MetabolismType =
  | "lipid" // 脂質代謝タイプ (脂質で太りやすい)
  | "carb" // 糖質タイプ (糖質で太りやすい)
  | "muscle" // 筋肉が付きにくいタイプ
  | "stress" // ストレスタイプ
  | "hypometabolism"; // 低代謝タイプ

export interface MetabolismTypeInfo {
  id: MetabolismType;
  name: string; // e.g. "脂質代謝タイプ"
  subName: string; // e.g. "脂質で太りやすい"
  tagline: string; // 短い要約
  description: string; // 体質の特徴詳細
  tendency: string; // 太りやすい原因・メカニズム
  recommendedPfc: PFCRatio; // このタイプに最適なPFC比率
  focusNutrients: string[]; // 意識して摂るべき栄養素
  cautionFoods: string[]; // 控えめにすべき食品
  bestFoods: string[]; // 相性の良いおすすめ食品
  practicalTip: string; // 日常の実践アドバイス
  emoji: string;
  themeColor: "amber" | "rose" | "blue" | "purple" | "emerald";
  accentColor: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  // Convenience aliases for flexible UI presentation
  title: string;
  shortTitle: string;
  icon: string;
  colorClass: string;
  advice: string;
  cause: string;
  recommendedFoods: string[];
}

export interface UserDietGoal {
  targetCalories: number;
  dietMode: DietMode;
  targetPfcRatio: PFCRatio; // Target percentages (sum to 100)
  targetWeight?: number;
  currentWeight?: number;
}

export interface UserProfile {
  id: string;
  name: string; // e.g. "Aさん", "Bさん"
  metabolismType: MetabolismType; // 代謝タイプ (脂質代謝・糖質・筋肉が付きにくい・ストレス・低代謝)
  avatarEmoji: string; // e.g. "🥑", "🍚", "💪", "🧘", "🔥"
  themeColor: "emerald" | "blue" | "purple" | "amber" | "rose" | "indigo";
  goal: UserDietGoal;
  notes?: string;
  createdAt: number;
}

export interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  proteinKcal: number;
  fatKcal: number;
  carbKcal: number;
  pfcRatio: PFCRatio;
  mealCount: number;
}

export interface AIAnalysisResult {
  dishName: string;
  summary: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  salt?: number;
  pfcRatio: PFCRatio;
  foodItems: FoodItem[];
  dietScore: number;
  dietAdvice: string;
  lineReplyDraft?: string;
}
