import React, { useState } from "react";
import { MealRecord, MealType, AIAnalysisResult, UserProfile } from "../types";
import { X, Plus, Sparkles, Check, AlertCircle, Loader2, Copy, Smartphone, MessageSquare } from "lucide-react";

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  defaultMealType?: MealType;
  onSaveMeal: (meal: MealRecord) => void;
  activeUser?: UserProfile;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultMealType = "lunch",
  onSaveMeal,
  activeUser,
}) => {
  const [dishName, setDishName] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [recordDate, setRecordDate] = useState<string>(defaultDate);
  const [recordTime, setRecordTime] = useState<string>("12:30");

  const [aiTextPrompt, setAiTextPrompt] = useState("");
  const [aiAdvice, setAiAdvice] = useState<string | undefined>(undefined);
  const [lineReplyDraft, setLineReplyDraft] = useState<string>("");
  const [copiedLineReply, setCopiedLineReply] = useState<boolean>(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiEstimate = async () => {
    if (!aiTextPrompt.trim()) return;
    setIsEstimating(true);
    setEstimateError(null);

    try {
      const response = await fetch("/api/estimate-text-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealDescription: aiTextPrompt,
          metabolismType: activeUser?.metabolismType || "lipid",
          userName: activeUser?.name || "ユーザー",
        }),
      });

      if (!response.ok) {
        throw new Error("AI推定リクエストに失敗しました。");
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || "データ形式が無効です。");
      }

      const data: AIAnalysisResult = resJson.data;
      setDishName(data.dishName);
      setCalories(String(data.calories));
      setProtein(String(data.protein));
      setFat(String(data.fat));
      setCarbs(String(data.carbs));
      if (data.dietAdvice) {
        setAiAdvice(data.dietAdvice);
      }
      if (data.lineReplyDraft) {
        setLineReplyDraft(data.lineReplyDraft);
      }
    } catch (err: any) {
      setEstimateError(err.message || "推定エラーが発生しました。");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCopyLineReply = async () => {
    if (!lineReplyDraft) return;
    try {
      await navigator.clipboard.writeText(lineReplyDraft);
      setCopiedLineReply(true);
      setTimeout(() => setCopiedLineReply(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = lineReplyDraft;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedLineReply(true);
      setTimeout(() => setCopiedLineReply(false), 2500);
    }
  };

  const handleSave = () => {
    if (!dishName.trim() || !calories) return;

    const calNum = parseInt(calories, 10) || 0;
    const pNum = parseFloat(protein) || 0;
    const fNum = parseFloat(fat) || 0;
    const cNum = parseFloat(carbs) || 0;

    const pKcal = pNum * 4;
    const fKcal = fNum * 9;
    const cKcal = cNum * 4;
    const totalPfcKcal = pKcal + fKcal + cKcal;

    let pfc = { proteinPercent: 20, fatPercent: 25, carbPercent: 55 };
    if (totalPfcKcal > 0) {
      const pPct = Math.round((pKcal / totalPfcKcal) * 100);
      const fPct = Math.round((fKcal / totalPfcKcal) * 100);
      const cPct = Math.max(0, 100 - pPct - fPct);
      pfc = { proteinPercent: pPct, fatPercent: fPct, carbPercent: cPct };
    }

    const newRecord: MealRecord = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: activeUser?.id || "user_a",
      date: recordDate,
      time: recordTime,
      mealType,
      dishName: dishName.trim(),
      calories: calNum,
      protein: Math.round(pNum * 10) / 10,
      fat: Math.round(fNum * 10) / 10,
      carbs: Math.round(cNum * 10) / 10,
      pfcRatio: pfc,
      foodItems: [
        {
          name: dishName.trim(),
          portion: "1食分",
          calories: calNum,
          protein: pNum,
          fat: fNum,
          carbs: cNum,
        },
      ],
      dietAdvice: aiAdvice,
      lineReplyDraft: lineReplyDraft.trim() || undefined,
      createdAt: Date.now(),
    };

    onSaveMeal(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">手動・テキストで食事を追加</h3>
                {activeUser && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span>{activeUser.avatarEmoji}</span>
                    <span>{activeUser.name}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700">数値を直接入力するか、文章からAIで自動推測</p>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* AI Text Estimation Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>文章でAI自動推測</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTextPrompt}
                onChange={(e) => setAiTextPrompt(e.target.value)}
                placeholder="例: 親子丼並盛とほうれん草のおひたし"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAiEstimate}
                disabled={isEstimating || !aiTextPrompt.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1"
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>推測中...</span>
                  </>
                ) : (
                  <span>AI推測</span>
                )}
              </button>
            </div>
            {estimateError && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{estimateError}</span>
              </p>
            )}
          </div>

          {/* Manual Form */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              料理名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="例: サラダチキンと玄米おにぎり"
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                カロリー (kcal) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 text-sm font-extrabold text-slate-900 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">
                たんぱく質 (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 text-sm font-bold text-blue-900 rounded-xl border border-blue-200 bg-blue-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">
                脂質 (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 text-sm font-bold text-amber-900 rounded-xl border border-amber-200 bg-amber-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                炭水化物 (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 text-sm font-bold text-rose-900 rounded-xl border border-rose-200 bg-rose-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">食事分類</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">日付</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">時間</label>
              <input
                type="time"
                value={recordTime}
                onChange={(e) => setRecordTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* LINE Reply Draft Area */}
          {(lineReplyDraft || aiAdvice) && (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#06C755]" />
                  <span>会員様へのLINE返信案</span>
                </span>
                {lineReplyDraft && (
                  <button
                    type="button"
                    onClick={handleCopyLineReply}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                      copiedLineReply ? "bg-emerald-700" : "bg-[#06C755] hover:bg-[#05b34c]"
                    }`}
                  >
                    {copiedLineReply ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>コピー済み</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>返信文をコピー</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={lineReplyDraft}
                onChange={(e) => setLineReplyDraft(e.target.value)}
                placeholder="AI推測を実行すると、会員様へのLINE返信メッセージ案がここに表示されます。"
                className="w-full p-2.5 bg-white rounded-lg border border-emerald-200/80 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-500">
                このメッセージをコピーして会員様のLINEトークにそのまま送信できます。
              </p>
            </div>
          )}
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
            type="button"
            onClick={handleSave}
            disabled={!dishName.trim() || !calories}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Check className="w-4 h-4" />
            <span>食事を保存する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
