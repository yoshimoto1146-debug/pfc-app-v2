import { MealRecord, UserDietGoal, DailySummary, PFCRatio, UserProfile } from "../types";
import { DEFAULT_DIET_GOAL, generateInitialMeals, generateSampleMealsForUserB } from "../data/sampleData";

const STORAGE_KEYS = {
  MEALS: "diet_app_meals_v1",
  GOAL: "diet_app_goal_v1",
  PROFILES: "diet_app_profiles_v1",
  ACTIVE_USER: "diet_app_active_user_v1",
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "user_a",
    name: "Aさん",
    metabolismType: "lipid",
    avatarEmoji: "🥑",
    themeColor: "amber",
    goal: {
      targetCalories: 1800,
      dietMode: "custom",
      targetPfcRatio: {
        proteinPercent: 25,
        fatPercent: 15,
        carbPercent: 60,
      },
      currentWeight: 63.0,
      targetWeight: 58.0,
    },
    notes: "脂質で太りやすい体質。油もの・揚げ物を控え、蒸し料理や和食中心に調整中。",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: "user_b",
    name: "Bさん",
    metabolismType: "carb",
    avatarEmoji: "🍚",
    themeColor: "rose",
    goal: {
      targetCalories: 1950,
      dietMode: "low-carb",
      targetPfcRatio: {
        proteinPercent: 25,
        fatPercent: 30,
        carbPercent: 45,
      },
      currentWeight: 71.5,
      targetWeight: 66.0,
    },
    notes: "糖質で太りやすい体質。ベジファーストと玄米・もち麦への置換で血糖値スパイクを防止。",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "user_c",
    name: "Cさん",
    metabolismType: "muscle",
    avatarEmoji: "💪",
    themeColor: "blue",
    goal: {
      targetCalories: 2200,
      dietMode: "high-protein",
      targetPfcRatio: {
        proteinPercent: 35,
        fatPercent: 20,
        carbPercent: 45,
      },
      currentWeight: 68.0,
      targetWeight: 70.0,
    },
    notes: "筋肉が付きにくいタイプ。毎食30g以上のたんぱく質確保とこまめなアミノ酸補給を実践。",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "user_d",
    name: "Dさん",
    metabolismType: "stress",
    avatarEmoji: "🧘",
    themeColor: "purple",
    goal: {
      targetCalories: 1850,
      dietMode: "balanced",
      targetPfcRatio: {
        proteinPercent: 22,
        fatPercent: 23,
        carbPercent: 55,
      },
      currentWeight: 60.5,
      targetWeight: 57.0,
    },
    notes: "ストレスタイプ。夕方の軽食と温かい汁物で夜の過食・やけ食いを予防。",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "user_e",
    name: "Eさん",
    metabolismType: "hypometabolism",
    avatarEmoji: "🔥",
    themeColor: "emerald",
    goal: {
      targetCalories: 1750,
      dietMode: "balanced",
      targetPfcRatio: {
        proteinPercent: 25,
        fatPercent: 20,
        carbPercent: 55,
      },
      currentWeight: 56.0,
      targetWeight: 52.0,
    },
    notes: "低代謝タイプ。生姜や温野菜・根菜を積極的に摂り、極端な絶食を避けて熱産生を刺激。",
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate missing metabolismType if stored from older version
      const migrated: UserProfile[] = parsed.map((p: any, idx: number) => {
        let defaultMeta: "lipid" | "carb" | "muscle" | "stress" | "hypometabolism" = "lipid";
        if (p.id === "user_b") defaultMeta = "carb";
        else if (p.id === "user_c") defaultMeta = "muscle";
        else if (p.id === "user_d") defaultMeta = "stress";
        else if (p.id === "user_e") defaultMeta = "hypometabolism";
        else {
          const types: Array<"lipid" | "carb" | "muscle" | "stress" | "hypometabolism"> = [
            "lipid",
            "carb",
            "muscle",
            "stress",
            "hypometabolism",
          ];
          defaultMeta = types[idx % types.length];
        }

        return {
          ...p,
          metabolismType: p.metabolismType || defaultMeta,
          avatarEmoji:
            p.avatarEmoji && p.avatarEmoji !== "👤" && p.avatarEmoji !== "🏃"
              ? p.avatarEmoji
              : p.metabolismType === "carb"
              ? "🍚"
              : p.metabolismType === "muscle"
              ? "💪"
              : p.metabolismType === "stress"
              ? "🧘"
              : p.metabolismType === "hypometabolism"
              ? "🔥"
              : "🥑",
        };
      });

      // If user only had 2 profiles previously, allow expanding to all 5 default metabolism types if desired
      if (migrated.length === 2 && migrated[0].id === "user_a" && migrated[1].id === "user_b") {
        const fullList = [
          migrated[0],
          migrated[1],
          DEFAULT_PROFILES[2],
          DEFAULT_PROFILES[3],
          DEFAULT_PROFILES[4],
        ];
        saveProfiles(fullList);
        return fullList;
      }

      saveProfiles(migrated);
      return migrated;
    }
    saveProfiles(DEFAULT_PROFILES);
    return DEFAULT_PROFILES;
  } catch (e) {
    console.error("Failed to load profiles from localStorage:", e);
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save profiles to localStorage:", e);
  }
}

export function loadActiveUserId(profiles: UserProfile[]): string {
  try {
    const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (savedId && profiles.some((p) => p.id === savedId)) {
      return savedId;
    }
    return profiles[0]?.id || "user_a";
  } catch (e) {
    return profiles[0]?.id || "user_a";
  }
}

export function saveActiveUserId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, id);
  } catch (e) {
    console.error("Failed to save active user id:", e);
  }
}

export function loadMeals(): MealRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) {
      const initialA = generateInitialMeals().map((m) => ({ ...m, userId: "user_a" }));
      const initialB = generateSampleMealsForUserB();
      const combined = [...initialA, ...initialB];
      saveMeals(combined);
      return combined;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const initialA = generateInitialMeals().map((m) => ({ ...m, userId: "user_a" }));
      return initialA;
    }

    // Migrate any older meals that lack a userId by associating them with 'user_a'
    let hasMigration = false;
    const migrated: MealRecord[] = parsed.map((m: any) => {
      if (!m.userId) {
        hasMigration = true;
        return { ...m, userId: "user_a" };
      }
      return m;
    });

    if (hasMigration) {
      saveMeals(migrated);
    }
    return migrated;
  } catch (e) {
    console.error("Failed to load meals from localStorage:", e);
    return generateInitialMeals().map((m) => ({ ...m, userId: "user_a" }));
  }
}

export function saveMeals(meals: MealRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error("Failed to save meals to localStorage:", e);
  }
}

export function loadDietGoal(): UserDietGoal {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (!raw) return DEFAULT_DIET_GOAL;
    return { ...DEFAULT_DIET_GOAL, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_DIET_GOAL;
  }
}

export function saveDietGoal(goal: UserDietGoal): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  } catch (e) {
    console.error("Failed to save diet goal:", e);
  }
}

export function calculatePfcRatio(proteinGrams: number, fatGrams: number, carbGrams: number): PFCRatio {
  const pKcal = proteinGrams * 4;
  const fKcal = fatGrams * 9;
  const cKcal = carbGrams * 4;
  const total = pKcal + fKcal + cKcal;

  if (total <= 0) {
    return { proteinPercent: 0, fatPercent: 0, carbPercent: 0 };
  }

  const pPct = Math.round((pKcal / total) * 100);
  const fPct = Math.round((fKcal / total) * 100);
  const cPct = Math.max(0, 100 - pPct - fPct);

  return {
    proteinPercent: pPct,
    fatPercent: fPct,
    carbPercent: cPct,
  };
}

export function getDailySummary(meals: MealRecord[], targetDate: string): DailySummary {
  const dayMeals = meals.filter((m) => m.date === targetDate);

  let totalCal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  for (const m of dayMeals) {
    totalCal += m.calories || 0;
    totalProtein += m.protein || 0;
    totalFat += m.fat || 0;
    totalCarbs += m.carbs || 0;
  }

  const pKcal = totalProtein * 4;
  const fKcal = totalFat * 9;
  const cKcal = totalCarbs * 4;
  const pfc = calculatePfcRatio(totalProtein, totalFat, totalCarbs);

  return {
    date: targetDate,
    calories: Math.round(totalCal),
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    proteinKcal: Math.round(pKcal),
    fatKcal: Math.round(fKcal),
    carbKcal: Math.round(cKcal),
    pfcRatio: pfc,
    mealCount: dayMeals.length,
  };
}

export function getPastDaysSummaries(meals: MealRecord[], daysCount: number): DailySummary[] {
  const summaries: DailySummary[] = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    summaries.push(getDailySummary(meals, dateStr));
  }

  return summaries;
}
