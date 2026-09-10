import React from "react";
import { DailySummary, UserDietGoal, UserProfile } from "../types";
import { Camera, PlusCircle, Flame, Target, Sparkles, Lightbulb } from "lucide-react";
import { getMetabolismInfo } from "../data/sampleData";

interface TodaySummaryProps {
  summary: DailySummary;
  goal: UserDietGoal;
  activeUser?: UserProfile;
  onOpenAiCamera: () => void;
  onOpenManualAdd: () => void;
}

export const TodaySummary: React.FC<TodaySummaryProps> = ({
  summary,
  goal,
  activeUser,
  onOpenAiCamera,
  onOpenManualAdd,
}) => {
  const targetCal = goal.targetCalories;
  const consumedCal = summary.calories;
  const remainingCal = Math.max(0, targetCal - consumedCal);
  const isOver = consumedCal > targetCal;
  const overCal = consumedCal - targetCal;
  const calPercent = Math.min(100, Math.round((consumedCal / targetCal) * 100));

  // Ideal target grams based on target calories and target PFC percentages:
  // Protein: 1g = 4kcal -> (targetCal * (targetP% / 100)) / 4
  const targetProteinGrams = Math.round((targetCal * (goal.targetPfcRatio.proteinPercent / 100)) / 4);
  // Fat: 1g = 9kcal -> (targetCal * (targetF% / 100)) / 9
  const targetFatGrams = Math.round((targetCal * (goal.targetPfcRatio.fatPercent / 100)) / 9);
  // Carbs: 1g = 4kcal -> (targetCal * (targetC% / 100)) / 4
  const targetCarbGrams = Math.round((targetCal * (goal.targetPfcRatio.carbPercent / 100)) / 4);

  // Total energy in PFC kcal
  const totalPfcKcal = summary.proteinKcal + summary.fatKcal + summary.carbKcal;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
      {/* Top Banner: Calories Overview & Primary CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Calorie Stats */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800">本日の摂取カロリー</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>目標: <strong>{targetCal.toLocaleString()}</strong> kcal</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {consumedCal.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-700">kcal 摂取</span>
            </div>

            <span className="text-slate-300">/</span>

            <div className="text-xs font-semibold">
              {isOver ? (
                <span className="text-rose-600 font-bold">
                  +{overCal.toLocaleString()} kcal 超過
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">
                  残り {remainingCal.toLocaleString()} kcal
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (consumedCal / targetCal) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-700 font-medium">
            <span>達成度: {calPercent}%</span>
            <span>記録数: {summary.mealCount}食</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-2.5">
          <button
            id="today-cta-camera"
            type="button"
            onClick={onOpenAiCamera}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>写真からAI解析・記録</span>
          </button>

          <button
            id="today-cta-manual"
            type="button"
            onClick={onOpenManualAdd}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>手動・テキスト入力で追加</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-5 border-slate-100" />

      {/* PFC Balance Overview */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            PFCバランス (3大栄養素の比率)
          </h3>
          <span className="text-[11px] text-slate-700">
            目標比率: P: <strong>{goal.targetPfcRatio.proteinPercent}%</strong> / F:{" "}
            <strong>{goal.targetPfcRatio.fatPercent}%</strong> / C:{" "}
            <strong>{goal.targetPfcRatio.carbPercent}%</strong>
          </span>
        </div>

        {/* Macro Detail Cards (P, F, C) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Protein (P) */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-700">たんぱく質 (Protein)</span>
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-blue-200/70 text-blue-800">
                {totalPfcKcal > 0 ? `${summary.pfcRatio.proteinPercent}%` : "0%"}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-bold text-slate-900">{summary.protein}</span>
              <span className="text-xs text-slate-700">g</span>
              <span className="text-[11px] text-slate-700 ml-auto">
                / 目標 {targetProteinGrams}g
              </span>
            </div>
            <div className="w-full bg-blue-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (summary.protein / (targetProteinGrams || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Fat (F) */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-700">脂質 (Fat)</span>
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-800">
                {totalPfcKcal > 0 ? `${summary.pfcRatio.fatPercent}%` : "0%"}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-bold text-slate-900">{summary.fat}</span>
              <span className="text-xs text-slate-700">g</span>
              <span className="text-[11px] text-slate-700 ml-auto">
                / 目標 {targetFatGrams}g
              </span>
            </div>
            <div className="w-full bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (summary.fat / (targetFatGrams || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs (C) */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-rose-700">炭水化物 (Carbohydrate)</span>
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-rose-200/70 text-rose-800">
                {totalPfcKcal > 0 ? `${summary.pfcRatio.carbPercent}%` : "0%"}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-bold text-slate-900">{summary.carbs}</span>
              <span className="text-xs text-slate-700">g</span>
              <span className="text-[11px] text-slate-700 ml-auto">
                / 目標 {targetCarbGrams}g
              </span>
            </div>
            <div className="w-full bg-rose-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (summary.carbs / (targetCarbGrams || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Visual PFC Ratio Stacked Bar vs Target Bar */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <div className="flex justify-between text-[11px] text-slate-700 mb-1">
              <span>本日の実測比率:</span>
              <span className="font-semibold text-slate-700">
                P: {summary.pfcRatio.proteinPercent}% / F: {summary.pfcRatio.fatPercent}% / C:{" "}
                {summary.pfcRatio.carbPercent}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
              {totalPfcKcal > 0 ? (
                <>
                  <div
                    title={`P: ${summary.pfcRatio.proteinPercent}%`}
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${summary.pfcRatio.proteinPercent}%` }}
                  />
                  <div
                    title={`F: ${summary.pfcRatio.fatPercent}%`}
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${summary.pfcRatio.fatPercent}%` }}
                  />
                  <div
                    title={`C: ${summary.pfcRatio.carbPercent}%`}
                    className="bg-rose-400 h-full transition-all"
                    style={{ width: `${summary.pfcRatio.carbPercent}%` }}
                  />
                </>
              ) : (
                <div className="w-full h-full text-center text-[10px] text-slate-600">
                  未記録
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-700 mb-1">
              <span>目標比率 ({goal.dietMode === "balanced" ? "バランス型" : goal.dietMode === "high-protein" ? "高たんぱく型" : goal.dietMode === "low-carb" ? "ロカボ型" : "カスタム"}):</span>
              <span className="font-semibold text-slate-700">
                P: {goal.targetPfcRatio.proteinPercent}% / F: {goal.targetPfcRatio.fatPercent}% / C:{" "}
                {goal.targetPfcRatio.carbPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden flex opacity-60">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${goal.targetPfcRatio.proteinPercent}%` }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${goal.targetPfcRatio.fatPercent}%` }}
              />
              <div
                className="bg-rose-400 h-full"
                style={{ width: `${goal.targetPfcRatio.carbPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metabolism Type Personalized Guidance Banner */}
      {activeUser && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">
              {getMetabolismInfo(activeUser.metabolismType).icon}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {activeUser.name}の体質:{" "}
              <span className="text-emerald-800 font-extrabold">
                {getMetabolismInfo(activeUser.metabolismType).title}
              </span>
              <span className="ml-1 text-[11px] font-semibold text-slate-500">
                ({getMetabolismInfo(activeUser.metabolismType).subName})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate max-w-md">
              {getMetabolismInfo(activeUser.metabolismType).advice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
