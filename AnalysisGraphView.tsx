import React, { useState } from "react";
import { MealRecord, UserDietGoal, UserProfile } from "../types";
import { getPastDaysSummaries } from "../services/storage";
import { getMetabolismInfo } from "../data/sampleData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  Flame,
} from "lucide-react";

interface AnalysisGraphViewProps {
  meals: MealRecord[];
  goal: UserDietGoal;
  activeUser?: UserProfile;
  onOpenGoalSettings: () => void;
}

export const AnalysisGraphView: React.FC<AnalysisGraphViewProps> = ({
  meals,
  goal,
  activeUser,
  onOpenGoalSettings,
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 14 | 30>(7);

  // Generate summaries for past N days
  const dailySummaries = getPastDaysSummaries(meals, periodDays);

  // Chart data for Daily Calories
  const calorieChartData = dailySummaries.map((s) => {
    // Format date MM/DD
    const parts = s.date.split("-");
    const shortDate = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
    const isOver = s.calories > goal.targetCalories;

    return {
      date: shortDate,
      fullDate: s.date,
      calories: s.calories,
      targetCalories: goal.targetCalories,
      isOver,
      mealCount: s.mealCount,
    };
  });

  // Calculate totals and averages
  const daysWithRecords = dailySummaries.filter((s) => s.calories > 0);
  const totalCalories = daysWithRecords.reduce((sum, s) => sum + s.calories, 0);
  const avgCalories = daysWithRecords.length > 0 ? Math.round(totalCalories / daysWithRecords.length) : 0;
  const targetAchievedCount = daysWithRecords.filter(
    (s) => s.calories > 0 && s.calories <= goal.targetCalories * 1.05
  ).length;

  // Macro Totals
  const totalProteinGrams = daysWithRecords.reduce((sum, s) => sum + s.protein, 0);
  const totalFatGrams = daysWithRecords.reduce((sum, s) => sum + s.fat, 0);
  const totalCarbsGrams = daysWithRecords.reduce((sum, s) => sum + s.carbs, 0);

  const totalProteinKcal = totalProteinGrams * 4;
  const totalFatKcal = totalFatGrams * 9;
  const totalCarbsKcal = totalCarbsGrams * 4;
  const grandPfcKcal = totalProteinKcal + totalFatKcal + totalCarbsKcal;

  const avgProteinPct = grandPfcKcal > 0 ? Math.round((totalProteinKcal / grandPfcKcal) * 100) : 0;
  const avgFatPct = grandPfcKcal > 0 ? Math.round((totalFatKcal / grandPfcKcal) * 100) : 0;
  const avgCarbPct = Math.max(0, 100 - avgProteinPct - avgFatPct);

  // Pie Chart Data for Average PFC
  const pfcPieData = [
    { name: "たんぱく質 (P)", value: avgProteinPct, grams: Math.round((totalProteinGrams / (daysWithRecords.length || 1)) * 10) / 10, color: "#3b82f6" },
    { name: "脂質 (F)", value: avgFatPct, grams: Math.round((totalFatGrams / (daysWithRecords.length || 1)) * 10) / 10, color: "#f59e0b" },
    { name: "炭水化物 (C)", value: avgCarbPct, grams: Math.round((totalCarbsGrams / (daysWithRecords.length || 1)) * 10) / 10, color: "#f43f5e" },
  ];

  // Target Pie Data
  const targetPieData = [
    { name: "P目標", value: goal.targetPfcRatio.proteinPercent, color: "#93c5fd" },
    { name: "F目標", value: goal.targetPfcRatio.fatPercent, color: "#fde68a" },
    { name: "C目標", value: goal.targetPfcRatio.carbPercent, color: "#fecdd3" },
  ];

  // Daily Macro Stacked Data (in grams)
  const macroChartData = dailySummaries.map((s) => {
    const parts = s.date.split("-");
    const shortDate = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
    return {
      date: shortDate,
      protein: s.protein,
      fat: s.fat,
      carbs: s.carbs,
    };
  });

  // AI Diet Insights based on user stats & metabolism type
  const getDietAnalysisInsight = () => {
    const pDiff = avgProteinPct - goal.targetPfcRatio.proteinPercent;
    const fDiff = avgFatPct - goal.targetPfcRatio.fatPercent;
    const cDiff = avgCarbPct - goal.targetPfcRatio.carbPercent;

    if (daysWithRecords.length === 0) {
      return "食事の記録を追加すると、グラフ分析とAI栄養評価がここに表示されます。";
    }

    let feedback = "";
    if (avgCalories > goal.targetCalories + 150) {
      feedback = `平均摂取カロリー(${avgCalories}kcal)が目標(${goal.targetCalories}kcal)を上回っています。間食の回数や夜遅くの食事を見直すことで、スムーズな減量ペースを取り戻せます。`;
    } else if (avgCalories < goal.targetCalories - 300) {
      feedback = `目標カロリーより摂取量が控えめ(${avgCalories}kcal)です。急な代謝低下を防ぐため、良質なたんぱく質や野菜をしっかり摂って適正エネルギーを確保しましょう。`;
    } else {
      feedback = `平均カロリー(${avgCalories}kcal)は目標(${goal.targetCalories}kcal)に綺麗に収まっており、非常に理想的なコントロールができています！`;
    }

    if (pDiff >= 0) {
      feedback += ` たんぱく質比率(${avgProteinPct}%)も目標(${goal.targetPfcRatio.proteinPercent}%)以上をキープできており、筋肉量を守る引き締まったボディメイクに繋がっています。`;
    } else {
      feedback += ` たんぱく質比率(${avgProteinPct}%)が目標(${goal.targetPfcRatio.proteinPercent}%)より少し低めです。卵、納豆、鶏むね肉、魚類をプラスするとさらに効果的です。`;
    }

    // Add metabolism-specific tailoring
    if (activeUser?.metabolismType) {
      const meta = getMetabolismInfo(activeUser.metabolismType);
      feedback += ` 【${meta.title}のポイント】${meta.advice}`;
    }

    return feedback;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>摂取カロリー＆PFCバランス グラフ分析</span>
            </h2>
            {activeUser && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getMetabolismInfo(activeUser.metabolismType).colorClass}`}>
                <span>{getMetabolismInfo(activeUser.metabolismType).icon}</span>
                <span>{activeUser.name} ({getMetabolismInfo(activeUser.metabolismType).shortTitle})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-700 mt-1">
            日々の記録から自動集計された栄養傾向と、体質タイプ別の目標達成度
          </p>
        </div>

        {/* Period Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriodDays(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodDays === days
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              過去{days}日間
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block mb-1">
            平均摂取カロリー
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {avgCalories.toLocaleString()}
            </span>
            <span className="text-xs text-slate-700 font-semibold">kcal / 日</span>
          </div>
          <span className="text-[10px] text-slate-700 mt-1 block">
            目標: {goal.targetCalories.toLocaleString()} kcal
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block mb-1">
            目標カロリー達成率
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-600">
              {daysWithRecords.length > 0
                ? Math.round((targetAchievedCount / daysWithRecords.length) * 100)
                : 0}
              %
            </span>
            <span className="text-xs text-slate-700 font-semibold">
              ({targetAchievedCount}/{daysWithRecords.length}日)
            </span>
          </div>
          <span className="text-[10px] text-slate-700 mt-1 block">適正範囲内を維持</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block mb-1">
            平均たんぱく質 (P)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-600">
              {pfcPieData[0].grams}
            </span>
            <span className="text-xs text-slate-700 font-semibold">g / 日</span>
          </div>
          <span className="text-[10px] text-blue-700 font-semibold mt-1 block">
            PFC比率: {avgProteinPct}% (目標 {goal.targetPfcRatio.proteinPercent}%)
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block mb-1">
            継続記録日数
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {daysWithRecords.length}
            </span>
            <span className="text-xs text-slate-700 font-semibold">日間</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            🔥 記録習慣が定着中
          </span>
        </div>
      </div>

      {/* Graph 1: Daily Calorie Intake vs Target Line */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>日別の摂取カロリー推移と目標ライン</span>
            </h3>
            <p className="text-xs text-slate-700">
              緑: 目標内達成 / 赤: 目標超過 / 点線: 目標値 ({goal.targetCalories} kcal)
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenGoalSettings}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            目標値を変更 →
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={calorieChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                stroke="#cbd5e1"
                domain={[0, (dataMax: number) => Math.max(goal.targetCalories + 300, Math.ceil(dataMax * 1.15))]}
              />
              <Tooltip
                formatter={(val: number | string | undefined) => [`${val ?? 0} kcal`, "摂取カロリー"]}
                labelFormatter={(label: any, items: any[]) => {
                  const item = items?.[0]?.payload;
                  return `${item?.fullDate || label} (${item?.mealCount || 0}食)`;
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine
                y={goal.targetCalories}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `目標: ${goal.targetCalories} kcal`,
                  position: "top",
                  fill: "#059669",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              />
              <Bar
                dataKey="calories"
                name="摂取カロリー"
                radius={[6, 6, 0, 0]}
              >
                {calorieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.calories === 0
                        ? "#e2e8f0"
                        : entry.calories > goal.targetCalories
                        ? "#f43f5e"
                        : "#10b981"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graph 2: PFC Balance Donut Chart & Target Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>PFCバランス比率の分析 (期間平均)</span>
              </h3>
              <p className="text-xs text-slate-700">
                摂取エネルギーに占めるタンパク質・脂質・炭水化物の比率
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
            {/* Donut Chart */}
            <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pfcPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pfcPieData.map((entry, index) => (
                      <Cell key={`pfc-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number | string | undefined) => [`${val ?? 0}%`, "比率"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold text-slate-700">実測比率</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {avgProteinPct}:{avgFatPct}:{avgCarbPct}
                </span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="sm:col-span-6 space-y-2.5">
              {/* Protein */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    たんぱく質 (Protein)
                  </span>
                  <span className="text-[11px] text-slate-700 ml-4 block">
                    日平均: {pfcPieData[0].grams}g
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-900">{avgProteinPct}%</span>
                  <span className="text-[10px] text-slate-700 block">
                    目標: {goal.targetPfcRatio.proteinPercent}%
                  </span>
                </div>
              </div>

              {/* Fat */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    脂質 (Fat)
                  </span>
                  <span className="text-[11px] text-slate-700 ml-4 block">
                    日平均: {pfcPieData[1].grams}g
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-900">{avgFatPct}%</span>
                  <span className="text-[10px] text-slate-700 block">
                    目標: {goal.targetPfcRatio.fatPercent}%
                  </span>
                </div>
              </div>

              {/* Carbs */}
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    炭水化物 (Carbohydrate)
                  </span>
                  <span className="text-[11px] text-slate-700 ml-4 block">
                    日平均: {pfcPieData[2].grams}g
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-rose-900">{avgCarbPct}%</span>
                  <span className="text-[10px] text-slate-700 block">
                    目標: {goal.targetPfcRatio.carbPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph 3: Daily Macro Nutrients in Grams (Stacked Bar) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              日別 3大栄養素のグラム推移
            </h3>
            <p className="text-xs text-slate-700 mb-3">
              青: たんぱく質 / 黄: 脂質 / 赤: 炭水化物
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={macroChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <Tooltip
                  formatter={(val: number | string | undefined, name: string | undefined) => [
                    `${val ?? 0}g`,
                    name === "protein"
                      ? "たんぱく質"
                      : name === "fat"
                      ? "脂質"
                      : "炭水化物",
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    fontSize: "11px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value) =>
                    value === "protein"
                      ? "P (たんぱく質)"
                      : value === "fat"
                      ? "F (脂質)"
                      : "C (炭水化物)"
                  }
                />
                <Bar dataKey="protein" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fat" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="carbs" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Dietitian Comprehensive Synthesis Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-2xl border border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lightbulb className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-emerald-950">
                管理栄養士AIによる期間栄養分析レポート
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                過去{periodDays}日間分析
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              {getDietAnalysisInsight()}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                健康ダイエット適正度: <strong>高</strong>
              </span>
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                代謝効率: <strong>良好</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
