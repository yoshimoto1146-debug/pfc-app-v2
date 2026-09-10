import { MealRecord, UserDietGoal, MetabolismType, MetabolismTypeInfo } from "../types";

export const METABOLISM_TYPES: Record<MetabolismType, MetabolismTypeInfo> = {
  lipid: {
    id: "lipid",
    name: "脂質代謝タイプ",
    subName: "脂質で太りやすい",
    tagline: "揚げ物や油分で皮下脂肪がつきやすい体質",
    description: "脂質代謝に関わる酵素の働きが緩やかで、油っこい食事やスイーツの脂質を体脂肪（下半身や二の腕）として蓄積しやすいタイプです。",
    tendency: "カロリーを制限していても脂質の比率が高いと体重が落ちにくい傾向があります。揚げ物や炒め物などの油分摂取に最も注意が必要です。",
    recommendedPfc: { proteinPercent: 25, fatPercent: 15, carbPercent: 60 },
    focusNutrients: ["低脂質・高たんぱく", "ビタミンB2（脂質代謝促進）", "水溶性食物繊維（脂質排出）", "良質なオメガ3"],
    cautionFoods: ["唐揚げ・天ぷら・フライドポテト", "脂身の多い豚バラ・霜降り肉", "生クリーム・洋菓子・クロワッサン", "マヨネーズ・過剰なドレッシング"],
    bestFoods: ["鶏むね肉・ささみ・タラ", "エビ・イカ・タコ", "キノコ類・ワカメ・めかぶ", "玄米・もち麦・オートミール"],
    practicalTip: "調理法は『炒める・揚げる』から『蒸す・煮る・網焼き』へシフト。揚げ物の衣を残すだけでも脂質を大幅にカットできます。",
    emoji: "🥑",
    themeColor: "amber",
    accentColor: "text-amber-700 bg-amber-50 border-amber-200",
    bgLight: "bg-amber-50",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    borderClass: "border-amber-300",
    title: "脂質代謝タイプ",
    shortTitle: "脂質タイプ",
    icon: "🥑",
    colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    advice: "調理法は『炒める・揚げる』から『蒸す・煮る・網焼き』へシフト。油分を控え、低脂質高たんぱくを意識しましょう。",
    cause: "脂質代謝酵素の活性が低く、油分の多い食事で皮下脂肪を溜め込みやすい体質です。",
    recommendedFoods: ["鶏むね肉・ささみ", "白身魚・タラ", "海藻・きのこ類", "もち麦・玄米"],
  },
  carb: {
    id: "carb",
    name: "糖質タイプ",
    subName: "糖質で太りやすい",
    tagline: "白米やパン・甘い物で血糖値が急上昇しやすい体質",
    description: "糖の代謝効率が低く、インスリンの急激な分泌によって過剰な糖が内臓脂肪（お腹周り・りんご型）に変わりやすいタイプです。",
    tendency: "食後に強い眠気を感じやすく、糖質が糖質を呼ぶ空腹スパイラルに陥りがち。主食の質と食べる順番が最重要です。",
    recommendedPfc: { proteinPercent: 25, fatPercent: 30, carbPercent: 45 },
    focusNutrients: ["低GI複合炭水化物", "ビタミンB1（糖代謝酵素サポート）", "不溶性・水溶性食物繊維", "良質なたんぱく質"],
    cautionFoods: ["白米大盛り・ラーメン・うどん", "砂糖入り清涼飲料・甘い缶コーヒー", "菓子パン・ドーナツ", "スナック菓子・ポテトチップス"],
    bestFoods: ["玄米・雑穀米・オートミール", "納豆・豆腐・枝豆", "サバ・サケ・青魚", "ブロッコリー・キャベツ（ベジファースト）"],
    practicalTip: "食事の最初は必ず野菜やキノコ・海藻から食べる『ベジファースト』を徹底。白米を玄米や大麦に置き換えて血糖スパイクを防ぎましょう。",
    emoji: "🍚",
    themeColor: "rose",
    accentColor: "text-rose-700 bg-rose-50 border-rose-200",
    bgLight: "bg-rose-50",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
    borderClass: "border-rose-300",
    title: "糖質タイプ",
    shortTitle: "糖質タイプ",
    icon: "🍚",
    colorClass: "text-rose-700 bg-rose-50 border-rose-200",
    advice: "野菜から先に食べるベジファーストを徹底し、白米を玄米やもち麦に替えて血糖スパイクを防ぎましょう。",
    cause: "糖の代謝分解が追いつかず、インスリン急分泌により余剰糖が内臓脂肪になりやすい体質です。",
    recommendedFoods: ["玄米・雑穀", "納豆・大豆製品", "青魚（サバ・サケ）", "ブロッコリー・海藻"],
  },
  muscle: {
    id: "muscle",
    name: "筋肉が付きにくいタイプ",
    subName: "筋肉が落ちやすくつきにくい",
    tagline: "たんぱく質が分解されやすく基礎代謝が下がりやすい体質",
    description: "たんぱく質の同化力（筋肉合成力）が弱く、エネルギー不足になるとすぐに筋肉を分解して代謝を落としてしまうハードゲイナー型です。",
    tendency: "食事制限をすると脂肪より先に筋肉が削られ、基礎代謝が急降下してリバウンドや『隠れ肥満』になりやすい体質です。",
    recommendedPfc: { proteinPercent: 35, fatPercent: 20, carbPercent: 45 },
    focusNutrients: ["良質なたんぱく質（毎食25〜30g）", "BCAA/必須アミノ酸", "ビタミンB6（たんぱく質再合成）", "亜鉛・マグネシウム"],
    cautionFoods: ["食事抜き・朝食欠食", "たんぱく質ゼロの軽食（おにぎりだけ等）", "過度な超低カロリー制限", "空腹時のハードな運動"],
    bestFoods: ["牛赤身肉・鶏むね肉・豚ヒレ肉", "卵・ギリシャヨーグルト", "ソイ/ホエイプロテイン", "アボカド・ナッツ・魚介類"],
    practicalTip: "1食あたり25g以上のたんぱく質を小分けで確実に補給。空腹時間を長くしすぎず、軽い筋力トレーニングを習慣づけましょう。",
    emoji: "💪",
    themeColor: "blue",
    accentColor: "text-blue-700 bg-blue-50 border-blue-200",
    bgLight: "bg-blue-50",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    borderClass: "border-blue-300",
    title: "筋肉が付きにくいタイプ",
    shortTitle: "筋肉タイプ",
    icon: "💪",
    colorClass: "text-blue-700 bg-blue-50 border-blue-200",
    advice: "毎食25g以上のたんぱく質を意識して補給し、過度な食事制限による筋肉減少・代謝低下を防ぎましょう。",
    cause: "たんぱく質合成が苦手で筋肉が分解されやすく、基礎代謝が落ちてリバウンドしやすい体質です。",
    recommendedFoods: ["鶏むね肉・豚ヒレ肉", "卵・ギリシャヨーグルト", "魚介類・赤身肉", "大豆製品・プロテイン"],
  },
  stress: {
    id: "stress",
    name: "ストレスタイプ",
    subName: "ストレスや疲労で乱れやすい",
    tagline: "コルチゾール分泌により過食衝動や夜の甘い物欲求が出やすい体質",
    description: "精神的・身体的ストレスにより自律神経やストレスホルモン（コルチゾール）が乱れ、急な食欲の暴走や甘い物への依存が起こりやすいタイプです。",
    tendency: "夜間や疲労時にドカ食いしやすく、胃腸の消化吸収機能も低下しがち。血糖値の急変動とメンタルの揺らぎが連動します。",
    recommendedPfc: { proteinPercent: 22, fatPercent: 23, carbPercent: 55 },
    focusNutrients: ["トリプトファン（セロトニンの材料）", "マグネシウム（神経鎮静・筋肉弛緩）", "ビタミンC（抗ストレス副腎サポート）", "GABA・発酵食品"],
    cautionFoods: ["多量カフェイン・エナジードリンク", "深夜のジャンクフード・やけ食い", "過度なアルコール", "激辛料理・強い刺激物"],
    bestFoods: ["具沢山の温かい味噌汁・ポトフ", "バナナ・アーモンド・豆乳", "サーモン・マグロ（オメガ3）", "発酵食品（キムチ・ヨーグルト）"],
    practicalTip: "食事の前に温かい白湯やスープをゆっくり飲み、副交感神経を優位に。夕方にナッツ等の小腹満たしを挟むと夜の過食を防げます。",
    emoji: "🧘",
    themeColor: "purple",
    accentColor: "text-purple-700 bg-purple-50 border-purple-200",
    bgLight: "bg-purple-50",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    borderClass: "border-purple-300",
    title: "ストレスタイプ",
    shortTitle: "ストレスタイプ",
    icon: "🧘",
    colorClass: "text-purple-700 bg-purple-50 border-purple-200",
    advice: "温かいスープで自律神経を整え、夕方のナッツ等で夜のドカ食い衝動を未然に防ぎましょう。",
    cause: "ストレスホルモン(コルチゾール)の影響で夜間や疲労時に過食衝動や甘い物欲求が出やすい体質です。",
    recommendedFoods: ["具沢山味噌汁・スープ", "バナナ・アーモンド", "サーモン・マグロ", "発酵食品・ヨーグルト"],
  },
  hypometabolism: {
    id: "hypometabolism",
    name: "低代謝タイプ",
    subName: "基礎代謝が低く冷え・省エネ体質",
    tagline: "平熱が低めで血流が滞り、エネルギーが燃焼しにくい体質",
    description: "体温が低めで末端の冷えやむくみが出やすく、食事誘発性熱産生（DIT）や基礎代謝が低水準な省エネ体質です。",
    tendency: "食事量を減らすと体が防衛モードになってさらに消費を抑えてしまい、少ししか食べていないのに痩せない悪循環に陥ります。",
    recommendedPfc: { proteinPercent: 25, fatPercent: 20, carbPercent: 55 },
    focusNutrients: ["温活スパイス（生姜・唐辛子・シナモン）", "鉄分（貧血予防・酸素運搬向上）", "ヨウ素（甲状腺ホルモン原料・海藻）", "噛みごたえのある根菜"],
    cautionFoods: ["氷水・冷たい清涼飲料", "生野菜サラダばかりの冷たい食事", "極端なファスティング（1日1食など）", "塩分過多の加工食品（むくみ悪化）"],
    bestFoods: ["生姜入り具沢山豚汁・生姜スープ", "根菜（ごぼう・れんこん・人参）", "赤身肉・レバー・あさり", "温かい雑穀玄米・お粥"],
    practicalTip: "冷たい飲み物を温かいお茶や白湯に変え、毎食温かい汁物をプラス。よく噛んで咀嚼回数を増やすことで熱産生（DIT）を高めましょう。",
    emoji: "🔥",
    themeColor: "emerald",
    accentColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    bgLight: "bg-emerald-50",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    borderClass: "border-emerald-300",
    title: "低代謝タイプ",
    shortTitle: "低代謝タイプ",
    icon: "🔥",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    advice: "温かい汁物や生姜・根菜を取り入れ、冷えを防いで食事誘発性熱産生(DIT)を刺激しましょう。",
    cause: "平熱・体温が低めで血流が滞りやすく、省エネ体質のため少食でもカロリーを消費しにくい傾向があります。",
    recommendedFoods: ["生姜スープ・具沢山豚汁", "ごぼう・人参など根菜", "赤身肉・あさり", "温かい玄米・雑穀米"],
  },
};

export function getMetabolismInfo(type: MetabolismType): MetabolismTypeInfo {
  return METABOLISM_TYPES[type] || METABOLISM_TYPES.lipid;
}

export const DEFAULT_DIET_GOAL: UserDietGoal = {
  targetCalories: 1800,
  dietMode: "balanced",
  targetPfcRatio: {
    proteinPercent: 20, // 20%
    fatPercent: 25,     // 25%
    carbPercent: 55,    // 55%
  },
  currentWeight: 65.5,
  targetWeight: 60.0,
};

export const DIET_PRESETS: Record<
  string,
  { label: string; desc: string; pfc: { proteinPercent: number; fatPercent: number; carbPercent: number } }
> = {
  balanced: {
    label: "健康バランス型 (標準)",
    desc: "厚生労働省推奨のバランス。健康的に無理なく体重を落としたい方に最適",
    pfc: { proteinPercent: 20, fatPercent: 25, carbPercent: 55 },
  },
  "high-protein": {
    label: "高たんぱく・筋力維持型",
    desc: "筋肉量を維持しながら体脂肪を減らす引き締めボディメイク向け",
    pfc: { proteinPercent: 30, fatPercent: 20, carbPercent: 50 },
  },
  "low-carb": {
    label: "緩やかな糖質制限 (ロカボ)",
    desc: "糖質を抑えて血糖値の急上昇を抑え、脂質を燃焼しやすい体を目指す",
    pfc: { proteinPercent: 25, fatPercent: 40, carbPercent: 35 },
  },
};

// Generate helper to format date as YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

// Initial realistic diet records for past days
export function generateInitialMeals(): MealRecord[] {
  const today = getDaysAgo(0);
  const day1 = getDaysAgo(1);
  const day2 = getDaysAgo(2);
  const day3 = getDaysAgo(3);
  const day4 = getDaysAgo(4);
  const day5 = getDaysAgo(5);
  const day6 = getDaysAgo(6);

  return [
    // Today
    {
      id: "meal-today-1",
      date: today,
      time: "07:30",
      mealType: "breakfast",
      dishName: "全粒粉トーストと目玉焼き・野菜サラダ",
      summary: "全粒粉パン1枚、目玉焼き1個、ミニトマトとブロッコリーのサラダ、ブラックコーヒー",
      calories: 380,
      protein: 16.5,
      fat: 14.0,
      carbs: 45.0,
      fiber: 4.2,
      salt: 1.1,
      pfcRatio: {
        proteinPercent: 18,
        fatPercent: 33,
        carbPercent: 49,
      },
      foodItems: [
        { name: "全粒粉食パン(6枚切1枚)", portion: "60g", calories: 150, protein: 5.5, fat: 2.0, carbs: 28.0 },
        { name: "目玉焼き(オリーブ油少々)", portion: "1個", calories: 110, protein: 7.0, fat: 8.5, carbs: 0.5 },
        { name: "ブロッコリー＆ミニトマト", portion: "80g", calories: 35, protein: 2.5, fat: 0.3, carbs: 6.0 },
        { name: "ノンオイル青じそドレッシング", portion: "15g", calories: 12, protein: 0.3, fat: 0.0, carbs: 2.5 },
        { name: "低脂肪ヨーグルト", portion: "100g", calories: 73, protein: 4.2, fat: 1.5, carbs: 8.0 },
      ],
      dietScore: 88,
      dietAdvice: "朝食にたんぱく質と野菜がバランス良く摂れています。昼食でも野菜と良質なたんぱく質を意識しましょう。",
      lineReplyDraft: "佐藤さん、朝食の共有ありがとうございます！☀️\n\n全粒粉トーストに目玉焼き、サラダと朝からたんぱく質もしっかり摂れていて素晴らしいスタートです👏✨ 脂質代謝タイプの方は朝に良質なたんぱく質と食物繊維を摂ることで1日の燃焼効率がグンと上がります。\n\nお昼もこの調子で、蒸し料理や焼き魚など油控えめのメニューがおすすめです！午後も応援しています💪",
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: "meal-today-2",
      date: today,
      time: "12:45",
      mealType: "lunch",
      dishName: "焼き鮭定食（玄米ご飯・豆腐わかめ味噌汁）",
      summary: "焼き鮭1切れ、玄米小盛り(150g)、豆腐とわかめの味噌汁、ほうれん草のお浸し",
      calories: 540,
      protein: 29.5,
      fat: 16.2,
      carbs: 65.0,
      fiber: 5.5,
      salt: 2.3,
      pfcRatio: {
        proteinPercent: 23,
        fatPercent: 27,
        carbPercent: 50,
      },
      foodItems: [
        { name: "銀鮭の塩焼き", portion: "80g", calories: 180, protein: 18.0, fat: 11.0, carbs: 0.2 },
        { name: "玄米ごはん", portion: "150g", calories: 248, protein: 4.2, fat: 1.5, carbs: 53.0 },
        { name: "豆腐とわかめの味噌汁", portion: "1杯", calories: 65, protein: 4.5, fat: 2.2, carbs: 6.0 },
        { name: "ほうれん草のお浸し", portion: "50g", calories: 22, protein: 1.5, fat: 0.2, carbs: 2.5 },
        { name: "きゅうりの浅漬け", portion: "30g", calories: 10, protein: 0.5, fat: 0.1, carbs: 1.8 },
      ],
      dietScore: 94,
      dietAdvice: "理想的なPFCバランスです！鮭に含まれる良質なオメガ3脂肪酸（EPA/DHA）が代謝を高めてくれます。",
      lineReplyDraft: "佐藤さん、お昼ごはんの共有ありがとうございます！🍱✨\n\n焼き鮭に玄米、具だくさん味噌汁でPFCバランスも94点と満点に近い素晴らしいチョイスです！👏\n鮭の良質なオメガ3脂肪酸は、脂質代謝タイプの方の代謝スイッチを活性化させてくれます。夜は少し炭水化物を控えめにして、タンパク質メインにすると完璧です！午後もファイトです😊",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },

    // Yesterday (Day 1)
    {
      id: "meal-d1-1",
      date: day1,
      time: "08:00",
      mealType: "breakfast",
      dishName: "オートミールボウルとバナナ・ギリシャヨーグルト",
      calories: 360,
      protein: 18.0,
      fat: 6.5,
      carbs: 58.0,
      pfcRatio: { proteinPercent: 20, fatPercent: 16, carbPercent: 64 },
      foodItems: [
        { name: "オートミール", portion: "40g", calories: 152, protein: 5.5, fat: 2.5, carbs: 27.0 },
        { name: "無糖ギリシャヨーグルト", portion: "100g", calories: 67, protein: 10.0, fat: 0.2, carbs: 3.5 },
        { name: "バナナ", portion: "1本", calories: 86, protein: 1.1, fat: 0.2, carbs: 22.5 },
        { name: "アーモンド", portion: "5粒", calories: 35, protein: 1.2, fat: 3.0, carbs: 1.0 },
      ],
      dietScore: 90,
      dietAdvice: "食物繊維豊富で低脂質な素晴らしい朝食です。腹持ちも抜群です。",
      createdAt: Date.now() - 1000 * 60 * 60 * 28,
    },
    {
      id: "meal-d1-2",
      date: day1,
      time: "12:30",
      mealType: "lunch",
      dishName: "鶏むね肉とブロッコリーのスパイスカレー",
      calories: 610,
      protein: 38.0,
      fat: 14.5,
      carbs: 78.0,
      pfcRatio: { proteinPercent: 25, fatPercent: 22, carbPercent: 53 },
      foodItems: [
        { name: "皮なし鶏むね肉カレー", portion: "200g", calories: 290, protein: 32.0, fat: 12.0, carbs: 12.0 },
        { name: "白米(少なめ)", portion: "180g", calories: 280, protein: 4.5, fat: 0.6, carbs: 64.0 },
        { name: "グリーンサラダ", portion: "60g", calories: 40, protein: 1.5, fat: 1.9, carbs: 2.0 },
      ],
      dietScore: 92,
      dietAdvice: "高たんぱくかつ脂質控えめで完璧なランチチョイスです。",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: "meal-d1-3",
      date: day1,
      time: "19:15",
      mealType: "dinner",
      dishName: "豚ヒレ肉のソテーと温野菜・具沢山豚汁",
      calories: 520,
      protein: 34.0,
      fat: 16.0,
      carbs: 56.0,
      pfcRatio: { proteinPercent: 27, fatPercent: 28, carbPercent: 45 },
      foodItems: [
        { name: "豚ヒレ肉ソテー", portion: "120g", calories: 210, protein: 27.0, fat: 6.0, carbs: 2.0 },
        { name: "温野菜（にんじん、キャベツ）", portion: "120g", calories: 50, protein: 1.8, fat: 0.3, carbs: 10.0 },
        { name: "具沢山豚汁(小盛り)", portion: "1杯", calories: 120, protein: 5.0, fat: 6.5, carbs: 8.0 },
        { name: "雑穀ご飯", portion: "100g", calories: 140, protein: 2.8, fat: 0.8, carbs: 32.0 },
      ],
      dietScore: 89,
      dietAdvice: "ビタミンB1豊富な豚ヒレ肉で疲労回復と代謝アップに効果的です。",
      createdAt: Date.now() - 1000 * 60 * 60 * 18,
    },
    {
      id: "meal-d1-4",
      date: day1,
      time: "15:30",
      mealType: "snack",
      dishName: "プロテインバーと緑茶",
      calories: 160,
      protein: 15.0,
      fat: 5.0,
      carbs: 13.0,
      pfcRatio: { proteinPercent: 39, fatPercent: 29, carbPercent: 32 },
      foodItems: [
        { name: "高たんぱくバー", portion: "1本", calories: 160, protein: 15.0, fat: 5.0, carbs: 13.0 },
      ],
      dietScore: 85,
      dietAdvice: "間食にたんぱく質を補給することで血糖値スパイクを防げました。",
      createdAt: Date.now() - 1000 * 60 * 60 * 21,
    },

    // Day 2
    {
      id: "meal-d2-1",
      date: day2,
      time: "08:15",
      mealType: "breakfast",
      dishName: "和朝食（納豆・生卵・玄米・味噌汁）",
      calories: 420,
      protein: 20.0,
      fat: 12.0,
      carbs: 58.0,
      pfcRatio: { proteinPercent: 19, fatPercent: 26, carbPercent: 55 },
      foodItems: [
        { name: "納豆", portion: "1パック", calories: 85, protein: 7.5, fat: 4.5, carbs: 4.5 },
        { name: "生卵", portion: "1個", calories: 75, protein: 6.2, fat: 5.0, carbs: 0.2 },
        { name: "玄米ご飯", portion: "150g", calories: 248, protein: 4.2, fat: 1.5, carbs: 53.0 },
      ],
      dietScore: 92,
      createdAt: Date.now() - 1000 * 60 * 60 * 50,
    },
    {
      id: "meal-d2-2",
      date: day2,
      time: "13:00",
      mealType: "lunch",
      dishName: "蒸し鶏とアボカドのグレインズボウル",
      calories: 590,
      protein: 32.0,
      fat: 21.0,
      carbs: 66.0,
      pfcRatio: { proteinPercent: 22, fatPercent: 32, carbPercent: 46 },
      foodItems: [
        { name: "蒸し鶏", portion: "120g", calories: 180, protein: 26.0, fat: 3.5, carbs: 0.0 },
        { name: "アボカド", portion: "1/2個", calories: 120, protein: 1.5, fat: 11.0, carbs: 4.0 },
        { name: "キヌア玄米", portion: "160g", calories: 250, protein: 4.5, fat: 2.0, carbs: 54.0 },
      ],
      dietScore: 91,
      createdAt: Date.now() - 1000 * 60 * 60 * 46,
    },
    {
      id: "meal-d2-3",
      date: day2,
      time: "19:40",
      mealType: "dinner",
      dishName: "タラの和風ホイル焼きと豆腐サラダ",
      calories: 450,
      protein: 33.0,
      fat: 11.0,
      carbs: 48.0,
      pfcRatio: { proteinPercent: 31, fatPercent: 23, carbPercent: 46 },
      foodItems: [
        { name: "タラのホイル焼き", portion: "150g", calories: 170, protein: 25.0, fat: 2.0, carbs: 6.0 },
        { name: "豆腐と水菜のサラダ", portion: "100g", calories: 95, protein: 5.5, fat: 4.5, carbs: 4.0 },
        { name: "雑穀ご飯(小盛り)", portion: "120g", calories: 170, protein: 3.0, fat: 0.8, carbs: 37.0 },
      ],
      dietScore: 95,
      createdAt: Date.now() - 1000 * 60 * 60 * 40,
    },

    // Day 3
    {
      id: "meal-d3-1",
      date: day3,
      time: "08:00",
      mealType: "breakfast",
      dishName: "バナナスムージーとゆで卵",
      calories: 340,
      protein: 16.0,
      fat: 8.0,
      carbs: 52.0,
      pfcRatio: { proteinPercent: 19, fatPercent: 21, carbPercent: 60 },
      foodItems: [
        { name: "豆乳バナナスムージー", portion: "250ml", calories: 210, protein: 8.0, fat: 3.0, carbs: 38.0 },
        { name: "ゆで卵", portion: "1個", calories: 75, protein: 6.5, fat: 5.0, carbs: 0.2 },
        { name: "ミックスナッツ", portion: "10g", calories: 60, protein: 1.8, fat: 5.2, carbs: 1.5 },
      ],
      dietScore: 86,
      createdAt: Date.now() - 1000 * 60 * 60 * 74,
    },
    {
      id: "meal-d3-2",
      date: day3,
      time: "12:30",
      mealType: "lunch",
      dishName: "十割そばと野菜のかき揚げ（半分）",
      calories: 640,
      protein: 21.0,
      fat: 18.0,
      carbs: 94.0,
      pfcRatio: { proteinPercent: 14, fatPercent: 26, carbPercent: 60 },
      foodItems: [
        { name: "もりそば(並)", portion: "200g", calories: 360, protein: 14.0, fat: 2.0, carbs: 70.0 },
        { name: "野菜かき揚げ", portion: "半分", calories: 180, protein: 3.0, fat: 14.0, carbs: 18.0 },
        { name: "温泉卵", portion: "1個", calories: 75, protein: 6.2, fat: 5.0, carbs: 0.3 },
      ],
      dietScore: 80,
      createdAt: Date.now() - 1000 * 60 * 60 * 70,
    },
    {
      id: "meal-d3-3",
      date: day3,
      time: "19:00",
      mealType: "dinner",
      dishName: "サバの塩焼きと大根おろし・きのこ汁",
      calories: 580,
      protein: 30.0,
      fat: 26.0,
      carbs: 52.0,
      pfcRatio: { proteinPercent: 21, fatPercent: 41, carbPercent: 38 },
      foodItems: [
        { name: "真サバの塩焼き", portion: "100g", calories: 260, protein: 20.0, fat: 19.0, carbs: 0.3 },
        { name: "きのこたっぷり味噌汁", portion: "1杯", calories: 55, protein: 3.0, fat: 1.2, carbs: 7.0 },
        { name: "玄米ごはん", portion: "150g", calories: 248, protein: 4.2, fat: 1.5, carbs: 53.0 },
      ],
      dietScore: 89,
      createdAt: Date.now() - 1000 * 60 * 60 * 63,
    },

    // Day 4
    {
      id: "meal-d4-1",
      date: day4,
      time: "07:45",
      mealType: "breakfast",
      dishName: "ライ麦パンとスクランブルエッグ",
      calories: 390,
      protein: 17.0,
      fat: 15.0,
      carbs: 46.0,
      pfcRatio: { proteinPercent: 18, fatPercent: 35, carbPercent: 47 },
      foodItems: [
        { name: "ライ麦食パン", portion: "1枚", calories: 160, protein: 5.0, fat: 2.0, carbs: 30.0 },
        { name: "スクランブルエッグ", portion: "卵2個分", calories: 180, protein: 11.0, fat: 13.0, carbs: 1.0 },
        { name: "トマトジュース", portion: "180ml", calories: 35, protein: 1.2, fat: 0.1, carbs: 7.0 },
      ],
      dietScore: 88,
      createdAt: Date.now() - 1000 * 60 * 60 * 98,
    },
    {
      id: "meal-d4-2",
      date: day4,
      time: "12:15",
      mealType: "lunch",
      dishName: "ローストチキンサラダラップとミネストローネ",
      calories: 520,
      protein: 28.0,
      fat: 16.0,
      carbs: 64.0,
      pfcRatio: { proteinPercent: 22, fatPercent: 28, carbPercent: 50 },
      foodItems: [
        { name: "チキンサラダラップ", portion: "1本", calories: 360, protein: 22.0, fat: 13.0, carbs: 42.0 },
        { name: "具沢山ミネストローネ", portion: "1杯", calories: 130, protein: 4.5, fat: 2.5, carbs: 20.0 },
      ],
      dietScore: 92,
      createdAt: Date.now() - 1000 * 60 * 60 * 93,
    },
    {
      id: "meal-d4-3",
      date: day4,
      time: "19:30",
      mealType: "dinner",
      dishName: "牛肉赤身ステーキとブロッコリーソテー",
      calories: 610,
      protein: 42.0,
      fat: 20.0,
      carbs: 58.0,
      pfcRatio: { proteinPercent: 28, fatPercent: 30, carbPercent: 42 },
      foodItems: [
        { name: "牛赤身肉ステーキ", portion: "150g", calories: 280, protein: 32.0, fat: 14.0, carbs: 1.0 },
        { name: "ブロッコリーとエリンギソテー", portion: "100g", calories: 65, protein: 4.0, fat: 3.0, carbs: 5.0 },
        { name: "白米", portion: "160g", calories: 250, protein: 4.0, fat: 0.5, carbs: 55.0 },
      ],
      dietScore: 91,
      createdAt: Date.now() - 1000 * 60 * 60 * 87,
    },

    // Day 5
    {
      id: "meal-d5-1",
      date: day5,
      time: "08:00",
      mealType: "breakfast",
      dishName: "グラノーラヨーグルトとキウイ",
      calories: 360,
      protein: 14.0,
      fat: 9.0,
      carbs: 56.0,
      pfcRatio: { proteinPercent: 16, fatPercent: 23, carbPercent: 61 },
      foodItems: [
        { name: "糖質オフグラノーラ", portion: "40g", calories: 170, protein: 7.0, fat: 6.0, carbs: 20.0 },
        { name: "プレーンヨーグルト", portion: "120g", calories: 80, protein: 4.5, fat: 3.5, carbs: 6.5 },
        { name: "キウイフルーツ", portion: "1個", calories: 55, protein: 1.0, fat: 0.1, carbs: 13.0 },
      ],
      dietScore: 87,
      createdAt: Date.now() - 1000 * 60 * 60 * 122,
    },
    {
      id: "meal-d5-2",
      date: day5,
      time: "12:40",
      mealType: "lunch",
      dishName: "マグロ赤身丼とあおさ海苔汁",
      calories: 540,
      protein: 36.0,
      fat: 6.0,
      carbs: 82.0,
      pfcRatio: { proteinPercent: 27, fatPercent: 10, carbPercent: 63 },
      foodItems: [
        { name: "マグロ赤身切り身", portion: "120g", calories: 150, protein: 31.0, fat: 1.5, carbs: 0.2 },
        { name: "酢飯", portion: "200g", calories: 340, protein: 4.8, fat: 0.8, carbs: 76.0 },
        { name: "あおさ味噌汁", portion: "1杯", calories: 40, protein: 2.0, fat: 0.8, carbs: 5.0 },
      ],
      dietScore: 93,
      createdAt: Date.now() - 1000 * 60 * 60 * 117,
    },
    {
      id: "meal-d5-3",
      date: day5,
      time: "19:00",
      mealType: "dinner",
      dishName: "鶏団子と白菜の生姜塩鍋",
      calories: 490,
      protein: 34.0,
      fat: 14.0,
      carbs: 52.0,
      pfcRatio: { proteinPercent: 28, fatPercent: 26, carbPercent: 46 },
      foodItems: [
        { name: "鶏むね肉団子鍋(野菜たっぷり)", portion: "1人前", calories: 310, protein: 28.0, fat: 11.0, carbs: 18.0 },
        { name: "うどん(半玉)", portion: "100g", calories: 120, protein: 3.5, fat: 0.5, carbs: 26.0 },
        { name: "もずく酢", portion: "1パック", calories: 25, protein: 0.3, fat: 0.1, carbs: 5.5 },
      ],
      dietScore: 95,
      createdAt: Date.now() - 1000 * 60 * 60 * 111,
    },

    // Day 6
    {
      id: "meal-d6-1",
      date: day6,
      time: "08:10",
      mealType: "breakfast",
      dishName: "フレンチトースト(低糖質パン)とイチゴ",
      calories: 390,
      protein: 16.0,
      fat: 13.0,
      carbs: 51.0,
      pfcRatio: { proteinPercent: 17, fatPercent: 30, carbPercent: 53 },
      foodItems: [
        { name: "低糖質フレンチトースト", portion: "1枚", calories: 280, protein: 12.0, fat: 12.0, carbs: 32.0 },
        { name: "いちご", portion: "5粒", calories: 35, protein: 0.7, fat: 0.1, carbs: 8.0 },
        { name: "ソイラテ", portion: "1杯", calories: 75, protein: 4.0, fat: 2.0, carbs: 8.5 },
      ],
      dietScore: 86,
      createdAt: Date.now() - 1000 * 60 * 60 * 146,
    },
    {
      id: "meal-d6-2",
      date: day6,
      time: "12:30",
      mealType: "lunch",
      dishName: "サバ缶とキャベツの和風トマトパスタ",
      calories: 590,
      protein: 30.0,
      fat: 15.0,
      carbs: 81.0,
      pfcRatio: { proteinPercent: 21, fatPercent: 23, carbPercent: 56 },
      foodItems: [
        { name: "全粒粉パスタ(乾麺80g)", portion: "茹で後200g", calories: 300, protein: 11.0, fat: 2.0, carbs: 62.0 },
        { name: "水煮サバ缶(半分)", portion: "90g", calories: 170, protein: 16.0, fat: 11.0, carbs: 0.2 },
        { name: "トマト缶ソースとキャベツ", portion: "150g", calories: 85, protein: 3.0, fat: 1.5, carbs: 14.0 },
      ],
      dietScore: 92,
      createdAt: Date.now() - 1000 * 60 * 60 * 141,
    },
    {
      id: "meal-d6-3",
      date: day6,
      time: "19:15",
      mealType: "dinner",
      dishName: "豆腐ハンバーグとおろしポン酢・ひじき煮",
      calories: 510,
      protein: 29.0,
      fat: 15.0,
      carbs: 63.0,
      pfcRatio: { proteinPercent: 23, fatPercent: 27, carbPercent: 50 },
      foodItems: [
        { name: "鶏ひき肉と豆腐のハンバーグ", portion: "130g", calories: 230, protein: 20.0, fat: 11.0, carbs: 8.0 },
        { name: "ひじきと大豆の煮物", portion: "50g", calories: 65, protein: 3.5, fat: 2.0, carbs: 8.0 },
        { name: "玄米ごはん", portion: "130g", calories: 215, protein: 3.6, fat: 1.3, carbs: 46.0 },
      ],
      dietScore: 93,
      createdAt: Date.now() - 1000 * 60 * 60 * 135,
    },
  ];
}

// Preset photo examples for instant test of AI analysis (SVG/Canvas representations with rich visual data)
export interface SamplePhotoPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedCal: number;
  previewSvg: string; // SVG string for crisp instant visual display
}

export const SAMPLE_MEAL_PRESETS: SamplePhotoPreset[] = [
  {
    id: "salmon-set",
    name: "焼き鮭定食（玄米・具沢山味噌汁・小鉢）",
    category: "和食・定番定食",
    description: "銀鮭の塩焼き、玄米ごはん、豆腐とわかめの味噌汁、ほうれん草のお浸し",
    expectedCal: 540,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#f5ede3" rx="16"/>
      <rect x="20" y="20" width="360" height="260" rx="12" fill="#d8be9b" opacity="0.6"/>
      <!-- Main Plate (Salmon) -->
      <rect x="40" y="45" width="200" height="110" rx="16" fill="#ffffff" stroke="#c8b49a" stroke-width="2"/>
      <path d="M 60 100 Q 120 70 190 95 Q 210 105 180 125 Q 110 135 60 100 Z" fill="#f3815c"/>
      <path d="M 75 92 Q 130 78 180 96" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M 90 106 Q 140 94 175 110" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
      <circle cx="210" cy="80" r="14" fill="#a7c957"/> <!-- Lemon/Parsley -->
      <rect x="70" y="125" width="40" height="15" rx="4" fill="#fff" opacity="0.9"/> <!-- Daikon oroshi -->
      <!-- Rice bowl -->
      <circle cx="100" cy="210" r="50" fill="#f8f9fa" stroke="#4a5568" stroke-width="3"/>
      <circle cx="100" cy="208" r="42" fill="#dfd0b8"/>
      <!-- Miso Soup bowl -->
      <circle cx="240" cy="210" r="45" fill="#3b2b20" stroke="#78350f" stroke-width="3"/>
      <circle cx="240" cy="210" r="38" fill="#b45309" opacity="0.9"/>
      <rect x="230" y="200" width="10" height="10" rx="2" fill="#fef3c7"/> <!-- Tofu -->
      <rect x="245" y="215" width="8" height="8" rx="2" fill="#fef3c7"/>
      <!-- Side dish -->
      <rect x="260" y="55" width="90" height="90" rx="12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
      <path d="M 280 85 C 290 70, 320 70, 330 90 C 330 110, 300 120, 280 110 Z" fill="#2d6a4f"/>
      <!-- Text label badge -->
      <rect x="40" y="240" width="320" height="30" rx="6" fill="#1e293b" opacity="0.85"/>
      <text x="200" y="260" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">和朝食 サンプル写真 (鮭定食 540kcal)</text>
    </svg>`,
  },
  {
    id: "chicken-salad",
    name: "グリルチキンとアボカドのパワーサラダ",
    category: "高たんぱく・低糖質",
    description: "ハーブチキン150g、アボカド、ゆで卵、ミックスビーンズ、トマト",
    expectedCal: 460,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#f1f5f9" rx="16"/>
      <!-- Big Salad Bowl -->
      <circle cx="200" cy="140" r="110" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
      <circle cx="200" cy="140" r="100" fill="#e2f1e6"/>
      <!-- Greens -->
      <circle cx="160" cy="120" r="35" fill="#40916c" opacity="0.9"/>
      <circle cx="230" cy="115" r="40" fill="#52b788" opacity="0.9"/>
      <circle cx="190" cy="170" r="38" fill="#2d6a4f" opacity="0.8"/>
      <!-- Grilled Chicken strips -->
      <path d="M 140 100 L 195 85 L 190 105 L 135 120 Z" fill="#d4a373"/>
      <line x1="150" y1="95" x2="185" y2="100" stroke="#7f4f24" stroke-width="2"/>
      <path d="M 130 125 L 185 110 L 180 130 L 125 145 Z" fill="#d4a373"/>
      <line x1="140" y1="120" x2="175" y2="125" stroke="#7f4f24" stroke-width="2"/>
      <!-- Avocado slices -->
      <ellipse cx="235" cy="155" rx="20" ry="12" fill="#99d98c" transform="rotate(-20 235 155)"/>
      <ellipse cx="245" cy="170" rx="18" ry="10" fill="#76c893" transform="rotate(-15 245 170)"/>
      <!-- Boiled egg -->
      <circle cx="220" cy="95" r="16" fill="#ffffff"/>
      <circle cx="220" cy="95" r="9" fill="#ffb703"/>
      <!-- Cherry tomatoes -->
      <circle cx="165" cy="155" r="10" fill="#e63946"/>
      <circle cx="180" cy="175" r="9" fill="#d90429"/>
      <!-- Badge -->
      <rect x="40" y="250" width="320" height="30" rx="6" fill="#1e293b" opacity="0.85"/>
      <text x="200" y="270" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">チキンサラダ サンプル写真 (460kcal P:38g)</text>
    </svg>`,
  },
  {
    id: "ramen-gyoza",
    name: "醤油ラーメンと焼き餃子(5個)",
    category: "外食・中華",
    description: "醤油ラーメン（チャーシュー2枚、メンマ、海苔、煮卵）、焼き餃子5個",
    expectedCal: 880,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#fdf8f0" rx="16"/>
      <rect x="20" y="20" width="360" height="260" rx="12" fill="#b91c1c" opacity="0.1"/>
      <!-- Ramen Bowl -->
      <circle cx="150" cy="140" r="85" fill="#f8fafc" stroke="#dc2626" stroke-width="4"/>
      <circle cx="150" cy="140" r="75" fill="#ca8a04" opacity="0.85"/> <!-- Soup -->
      <!-- Noodles -->
      <path d="M 120 120 Q 150 160 180 120" stroke="#fef08a" stroke-width="4" fill="none"/>
      <path d="M 115 135 Q 145 175 175 135" stroke="#fef08a" stroke-width="4" fill="none"/>
      <!-- Chashu -->
      <circle cx="130" cy="115" r="18" fill="#b45309"/>
      <circle cx="130" cy="115" r="12" fill="#fde68a" opacity="0.5"/>
      <!-- Egg -->
      <ellipse cx="170" cy="120" rx="14" ry="10" fill="#ffffff"/>
      <ellipse cx="170" cy="120" rx="9" ry="6" fill="#ea580c"/>
      <!-- Nori & Green onion -->
      <rect x="165" y="80" width="22" height="35" rx="2" fill="#1e293b"/>
      <circle cx="145" cy="155" r="12" fill="#15803d"/>
      <!-- Gyoza Plate -->
      <rect x="250" y="80" width="115" height="130" rx="12" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <!-- 5 Gyozas -->
      <path d="M 265 100 Q 305 90 345 100 Q 305 115 265 100 Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <path d="M 265 125 Q 305 115 345 125 Q 305 140 265 125 Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <path d="M 265 150 Q 305 140 345 150 Q 305 165 265 150 Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <path d="M 265 175 Q 305 165 345 175 Q 305 190 265 175 Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <!-- Badge -->
      <rect x="40" y="245" width="320" height="30" rx="6" fill="#1e293b" opacity="0.85"/>
      <text x="200" y="265" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">ラーメン＆餃子 サンプル写真 (880kcal C:105g)</text>
    </svg>`,
  },
];

// Initial realistic diet records for User B (e.g. Bさん: High Protein / Training Diet)
export function generateSampleMealsForUserB(): MealRecord[] {
  const today = getDaysAgo(0);
  const day1 = getDaysAgo(1);
  const day2 = getDaysAgo(2);

  return [
    {
      id: "meal-user-b-today-1",
      userId: "user_b",
      date: today,
      time: "08:00",
      mealType: "breakfast",
      dishName: "ホエイプロテインスムージー＆バナナ",
      summary: "プロテインパウダー(WPI)30g、無脂肪乳200ml、バナナ1本、オートミール30g",
      calories: 360,
      protein: 35.0,
      fat: 3.5,
      carbs: 48.0,
      fiber: 4.5,
      salt: 0.6,
      pfcRatio: {
        proteinPercent: 39,
        fatPercent: 9,
        carbPercent: 52,
      },
      foodItems: [
        { name: "ホエイプロテイン(WPI)", portion: "30g", calories: 120, protein: 26.0, fat: 0.5, carbs: 2.0 },
        { name: "無脂肪乳", portion: "200ml", calories: 70, protein: 6.8, fat: 0.2, carbs: 10.0 },
        { name: "バナナ", portion: "1本(100g)", calories: 86, protein: 1.1, fat: 0.2, carbs: 22.5 },
        { name: "オートミール", portion: "30g", calories: 110, protein: 4.0, fat: 2.0, carbs: 18.0 },
      ],
      dietScore: 92,
      dietAdvice: "起床後の素早いアミノ酸補給と持続性のある複合炭水化物の組み合わせが完璧です。高たんぱく目標にぴったり合致しています。",
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: "meal-user-b-today-2",
      userId: "user_b",
      date: today,
      time: "12:30",
      mealType: "lunch",
      dishName: "鶏むね肉のハーブグリルプレート（玄米・ブロッコリー大盛り）",
      summary: "皮なし鶏胸肉200gグリル、玄米ご飯180g、茹でブロッコリー100g、ミニトマト",
      calories: 620,
      protein: 48.0,
      fat: 10.0,
      carbs: 78.0,
      fiber: 7.2,
      salt: 1.4,
      pfcRatio: {
        proteinPercent: 32,
        fatPercent: 15,
        carbPercent: 53,
      },
      foodItems: [
        { name: "皮なし鶏むね肉ハーブグリル", portion: "200g", calories: 240, protein: 44.0, fat: 4.0, carbs: 1.0 },
        { name: "玄米ごはん", portion: "1膳(180g)", calories: 295, protein: 5.0, fat: 2.0, carbs: 64.0 },
        { name: "ブロッコリーとミニトマト", portion: "大盛り(120g)", calories: 50, protein: 4.0, fat: 0.5, carbs: 8.0 },
        { name: "オリーブオイル少々", portion: "小さじ1", calories: 40, protein: 0.0, fat: 4.5, carbs: 0.0 },
      ],
      dietScore: 96,
      dietAdvice: "圧倒的な高たんぱくかつ低脂質な食事です。午後のトレーニングや代謝維持に最高の内容です。",
      createdAt: Date.now() - 3600000 * 1,
    },
    {
      id: "meal-user-b-day1-1",
      userId: "user_b",
      date: day1,
      time: "19:00",
      mealType: "dinner",
      dishName: "牛赤身肉ステーキとグリル野菜定食",
      summary: "牛ヒレ肉150g、アスパラとパプリカのソテー、玄米ご飯150g、わかめスープ",
      calories: 680,
      protein: 42.0,
      fat: 18.0,
      carbs: 65.0,
      fiber: 5.0,
      salt: 1.8,
      pfcRatio: {
        proteinPercent: 27,
        fatPercent: 26,
        carbPercent: 47,
      },
      foodItems: [
        { name: "牛ヒレ赤身肉ステーキ", portion: "150g", calories: 310, protein: 32.0, fat: 14.0, carbs: 0.5 },
        { name: "玄米ごはん", portion: "150g", calories: 245, protein: 4.2, fat: 1.5, carbs: 53.0 },
        { name: "アスパラとパプリカのソテー", portion: "1皿", calories: 80, protein: 3.5, fat: 2.0, carbs: 9.0 },
        { name: "わかめスープ", portion: "1杯", calories: 45, protein: 2.3, fat: 0.5, carbs: 2.5 },
      ],
      dietScore: 94,
      dietAdvice: "赤身肉によるヘム鉄と良質なたんぱく質補給がしっかりできています。",
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: "meal-user-b-day2-1",
      userId: "user_b",
      date: day2,
      time: "12:15",
      mealType: "lunch",
      dishName: "マグロ赤身とアボカドのポキ丼",
      summary: "マグロ赤身120g、アボカド1/2個、もち麦ご飯180g、刻み海苔、味噌汁",
      calories: 610,
      protein: 38.0,
      fat: 16.0,
      carbs: 72.0,
      fiber: 6.8,
      salt: 2.0,
      pfcRatio: {
        proteinPercent: 26,
        fatPercent: 25,
        carbPercent: 49,
      },
      foodItems: [
        { name: "マグロ赤身", portion: "120g", calories: 150, protein: 31.0, fat: 1.5, carbs: 0.2 },
        { name: "アボカド", portion: "1/2個", calories: 120, protein: 1.5, fat: 12.0, carbs: 4.0 },
        { name: "もち麦ごはん", portion: "180g", calories: 280, protein: 5.0, fat: 1.2, carbs: 62.0 },
        { name: "豆腐とネギの味噌汁", portion: "1杯", calories: 60, protein: 3.5, fat: 1.3, carbs: 5.8 },
      ],
      dietScore: 93,
      dietAdvice: "マグロの高たんぱくとアボカドの良質な不飽和脂肪酸の組み合わせが素晴らしいです。",
      createdAt: Date.now() - 86400000 * 2,
    },
  ];
}
