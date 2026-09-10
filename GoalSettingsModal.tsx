import React, { useState, useEffect } from "react";
import { UserDietGoal, DietMode, PFCRatio } from "../types";
import { DIET_PRESETS } from "../data/sampleData";
import { X, Target, Save, Check, Scale } from "lucide-react";

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: UserDietGoal;
  userName?: string;
  onSaveGoal: (newGoal: UserDietGoal) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  goal,
  userName,
  onSaveGoal,
}) => {
  const [targetCalories, setTargetCalories] = useState<number>(goal.targetCalories);
  const [dietMode, setDietMode] = useState<DietMode>(goal.dietMode);
  const [pfcRatio, setPfcRatio] = useState<PFCRatio>(goal.targetPfcRatio);
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(goal.currentWeight);
  const [targetWeight, setTargetWeight] = useState<number | undefined>(goal.targetWeight);

  useEffect(() => {
    if (isOpen) {
      setTargetCalories(goal.targetCalories);
      setDietMode(goal.dietMode);
      setPfcRatio(goal.targetPfcRatio);
      setCurrentWeight(goal.currentWeight);
      setTargetWeight(goal.targetWeight);
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: DietMode) => {
    setDietMode(mode);
    if (mode !== "custom" && DIET_PRESETS[mode]) {
      setPfcRatio(DIET_PRESETS[mode].pfc);
    }
  };

  const handlePfcChange = (key: keyof PFCRatio, value: number) => {
    setDietMode("custom");
    setPfcRatio((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sumPfc = pfcRatio.proteinPercent + pfcRatio.fatPercent + pfcRatio.carbPercent;
  const isPfcValid = sumPfc === 100;

  const handleSave = () => {
    onSaveGoal({
      targetCalories: Math.max(800, Math.min(5000, targetCalories)),
      dietMode,
      targetPfcRatio: pfcRatio,
      currentWeight,
      targetWeight,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {userName ? `${userName}の目標＆PFC設定` : "目標＆PFCバランス設定"}
              </h3>
              <p className="text-xs text-slate-700">目標カロリーと三大栄養素の比率を設定</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Target Calories */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1日の目標摂取カロリー (kcal)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="50"
                min="800"
                max="4000"
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-36 px-3 py-2 text-base font-extrabold text-slate-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-xs text-slate-700 font-medium">kcal / 日</span>
            </div>
            <p className="text-[11px] text-slate-700 mt-1">
              標準目安: 成人女性 1,600〜1,800kcal / 成人男性 1,900〜2,200kcal
            </p>
          </div>

          {/* Diet Mode Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              ダイエットスタイル・PFC目標プリセット
            </label>
            <div className="space-y-2">
              {Object.entries(DIET_PRESETS).map(([key, item]) => {
                const isSelected = dietMode === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectMode(key as DietMode)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.label}</span>
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        P:{item.pfc.proteinPercent}% / F:{item.pfc.fatPercent}% / C:
                        {item.pfc.carbPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom PFC Inputs */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800">
                PFC目標比率の個別調整 (合計100%)
              </span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                  isPfcValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
                }`}
              >
                合計: {sumPfc}% {isPfcValid ? "✓" : "(100%にしてください)"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-blue-700 block mb-1">
                  P (たんぱく質)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={pfcRatio.proteinPercent}
                    onChange={(e) => handlePfcChange("proteinPercent", Number(e.target.value))}
                    className="w-full text-xs font-bold px-1.5 py-1 border border-slate-200 rounded"
                  />
                  <span className="text-xs text-slate-600">%</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-amber-700 block mb-1">
                  F (脂質)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={pfcRatio.fatPercent}
                    onChange={(e) => handlePfcChange("fatPercent", Number(e.target.value))}
                    className="w-full text-xs font-bold px-1.5 py-1 border border-slate-200 rounded"
                  />
                  <span className="text-xs text-slate-600">%</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-rose-700 block mb-1">
                  C (炭水化物)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={pfcRatio.carbPercent}
                    onChange={(e) => handlePfcChange("carbPercent", Number(e.target.value))}
                    className="w-full text-xs font-bold px-1.5 py-1 border border-slate-200 rounded"
                  />
                  <span className="text-xs text-slate-600">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weight progress tracking */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-800">
              <Scale className="w-4 h-4 text-slate-500" />
              <span>体重目標 (任意)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 mb-1">現在の体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight || ""}
                  onChange={(e) => setCurrentWeight(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="例: 65.0"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 mb-1">目標体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight || ""}
                  onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="例: 60.0"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            キャンセル
          </button>
          <button
            id="save-goal-settings-btn"
            type="button"
            onClick={handleSave}
            disabled={!isPfcValid}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>設定を保存する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
