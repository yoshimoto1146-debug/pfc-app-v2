import React, { useState, useEffect } from "react";
import { MealRecord, UserProfile, LineToneType } from "../types";
import { getMetabolismInfo } from "../data/sampleData";
import {
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  X,
  Sparkles,
  Send,
  Sliders,
  Smartphone,
  Edit3,
  Flame,
  Info,
} from "lucide-react";

interface LineReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealRecord | null;
  activeUser: UserProfile;
  onSaveReplyDraft?: (mealId: string, replyText: string) => void;
}

const TONE_OPTIONS: {
  id: LineToneType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "supportive",
    label: "丁寧＆親身",
    icon: "🤝",
    desc: "安心感を与える温かい敬語。食事報告への感謝と優しいアドバイス",
  },
  {
    id: "positive",
    label: "ポジティブ＆褒める",
    icon: "🎉",
    desc: "努力を絶賛！絵文字多めでモチベーションを高める元気なトーン",
  },
  {
    id: "concise",
    label: "簡潔＆要点クイック",
    icon: "⚡",
    desc: "忙しい会員様向けに要点（Goodと改善ポイント）を短くまとめる",
  },
  {
    id: "logical",
    label: "論理的・PFC重視",
    icon: "📊",
    desc: "カロリーやPFC数値を引用し、代謝メカニズムに基づいて解説",
  },
];

export const LineReplyModal: React.FC<LineReplyModalProps> = ({
  isOpen,
  onClose,
  meal,
  activeUser,
  onSaveReplyDraft,
}) => {
  const [replyText, setReplyText] = useState("");
  const [selectedTone, setSelectedTone] = useState<LineToneType>("supportive");
  const [trainerNote, setTrainerNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing draft or generate initial reply
  useEffect(() => {
    if (!isOpen || !meal) return;

    if (meal.lineReplyDraft && meal.lineReplyDraft.trim()) {
      setReplyText(meal.lineReplyDraft);
    } else {
      // Auto-generate if not present
      handleGenerateReply(selectedTone);
    }
  }, [isOpen, meal?.id]);

  if (!isOpen || !meal) return null;

  const meta = getMetabolismInfo(activeUser.metabolismType || "lipid");

  const handleGenerateReply = async (toneToUse: LineToneType = selectedTone) => {
    if (!meal) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-line-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: activeUser.name || "会員",
          metabolismType: activeUser.metabolismType || "lipid",
          dishName: meal.dishName || "お食事",
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          fat: meal.fat || 0,
          carbs: meal.carbs || 0,
          dietAdvice: meal.dietAdvice || "",
          tone: toneToUse,
          trainerNote: trainerNote.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("LINE返信の生成に失敗しました。");
      }

      const data = await response.json();
      if (data.replyText) {
        setReplyText(data.replyText);
        if (onSaveReplyDraft) {
          onSaveReplyDraft(meal.id, data.replyText);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "返信文の生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!replyText) return;
    try {
      await navigator.clipboard.writeText(replyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Save if callback provided
      if (onSaveReplyDraft && meal) {
        onSaveReplyDraft(meal.id, replyText);
      }
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = replyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveAndClose = () => {
    if (onSaveReplyDraft && meal && replyText) {
      onSaveReplyDraft(meal.id, replyText);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  LINE返信メッセージ作成
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {activeUser.name}様宛
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.colorClass}`}>
                  {meta.icon} {meta.shortTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                会員様の食事報告（写真・メニュー）を分析した結果をもとにLINE返信文を生成し、ワンクリックでコピペ返信できます
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Target Meal Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt={meal.dishName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                  🍽️
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {meal.dishName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 flex-wrap">
                  <span className="font-semibold text-slate-800">
                    {meal.calories.toLocaleString()} kcal
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>P: {meal.protein}g</span>
                  <span>F: {meal.fat}g</span>
                  <span>C: {meal.carbs}g</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:self-center shrink-0">
              <span className="text-[11px] text-slate-500 block">
                {meal.date} {meal.time}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 mt-1">
                スコア: <strong className="text-emerald-600">{meal.dietScore || 85}点</strong>
              </span>
            </div>
          </div>

          {/* Tone Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>返信のトーン・雰囲気を選択:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                クリックするとトーンに合わせて再生成されます
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONE_OPTIONS.map((t) => {
                const isSelected = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTone(t.id);
                      handleGenerateReply(t.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{t.icon}</span>
                      <span className={`text-xs font-bold ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trainer Custom Note / Instruction (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>トレーナーからの個別伝達事項・追記メモ</span>
                <span className="text-[10px] text-slate-400 font-normal">(任意)</span>
              </label>
              {trainerNote && (
                <button
                  type="button"
                  onClick={() => setTrainerNote("")}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: 夜は炭水化物控えめで、明日のセッション19時にお待ちしています！"
                value={trainerNote}
                onChange={(e) => setTrainerNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGenerateReply();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="button"
                onClick={() => handleGenerateReply()}
                disabled={isGenerating}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-50 shrink-0 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                <span>反映して再作成</span>
              </button>
            </div>
          </div>

          {/* LINE Talk Bubble Preview & Editable Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>LINE返信メッセージ本文 (編集可能)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">
                  {replyText.length}文字
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerateReply()}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AIで再生成</span>
                </button>
              </div>
            </div>

            {/* Simulated LINE Talk Screen */}
            <div className="bg-[#7494C0]/15 border border-slate-200 rounded-2xl p-4 sm:p-5 relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs shadow-xs">
                    {activeUser.avatarEmoji || "👤"}
                  </div>
                  <span className="font-bold text-slate-800">{activeUser.name} 様とのトーク</span>
                </div>
                <span className="text-[10px] text-slate-500">LINE返信プレビュー</span>
              </div>

              {/* Speech Bubble (Green LINE style) */}
              <div className="flex justify-end">
                <div className="max-w-[92%] sm:max-w-[85%] w-full bg-[#85E249]/35 border border-[#68BF34]/40 rounded-2xl rounded-tr-xs p-3 sm:p-4 text-xs text-slate-900 shadow-xs relative">
                  {isGenerating ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-600">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      <span className="text-xs font-medium">
                        {activeUser.name}様の代謝タイプに合わせてLINE返信文を生成中...
                      </span>
                    </div>
                  ) : (
                    <textarea
                      rows={8}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="ここにLINE返信文が生成されます。自由に加筆修正できます。"
                      className="w-full bg-transparent resize-y border-none focus:outline-none text-xs text-slate-900 leading-relaxed placeholder:text-slate-400 font-sans"
                    />
                  )}

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#68BF34]/30 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      直接文字を編集できます
                    </span>
                    <span>既読</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions: Copy Button is Primary */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition-colors order-2 sm:order-1"
          >
            下書きを保存して閉じる
          </button>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              id="copy-line-reply-btn"
              onClick={handleCopy}
              disabled={isGenerating || !replyText.trim()}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 ${
                copied
                  ? "bg-emerald-700 ring-2 ring-emerald-400"
                  : "bg-[#06C755] hover:bg-[#05b34c]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>コピーしました！LINEにペーストできます</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>LINE返信文をコピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
