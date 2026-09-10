import React, { useState } from "react";
import { MealRecord, MealType } from "../types";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Plus,
  Info,
  AlertTriangle,
  X,
  MessageSquare,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";

interface MealListProps {
  meals: MealRecord[];
  onDeleteMeal: (id: string) => void;
  onAddMealForSlot: (slot: MealType) => void;
  onOpenLineReply?: (meal: MealRecord) => void;
}

const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; iconEmoji: string; defaultTime: string; desc: string }
> = {
  breakfast: { label: "朝食", iconEmoji: "🌅", defaultTime: "08:00", desc: "1日の代謝のスイッチを入れる" },
  lunch: { label: "昼食", iconEmoji: "☀️", defaultTime: "12:30", desc: "午後のエネルギー源を補給" },
  dinner: { label: "夕食", iconEmoji: "🌙", defaultTime: "19:00", desc: "就寝前の消化と修復を考慮" },
  snack: { label: "間食", iconEmoji: "☕", defaultTime: "15:00", desc: "小腹対策・たんぱく質補給" },
};

export const MealList: React.FC<MealListProps> = ({
  meals,
  onDeleteMeal,
  onAddMealForSlot,
  onOpenLineReply,
}) => {
  const [expandedMealIds, setExpandedMealIds] = useState<Record<string, boolean>>({});
  const [mealToDelete, setMealToDelete] = useState<MealRecord | null>(null);
  const [copiedMealId, setCopiedMealId] = useState<string | null>(null);

  const handleDirectCopy = async (meal: MealRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meal.lineReplyDraft) return;
    try {
      await navigator.clipboard.writeText(meal.lineReplyDraft);
      setCopiedMealId(meal.id);
      setTimeout(() => setCopiedMealId(null), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = meal.lineReplyDraft;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedMealId(meal.id);
      setTimeout(() => setCopiedMealId(null), 2500);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMealIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const mealSlots: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          食事の記録一覧
        </h2>
        <span className="text-xs text-slate-700">
          全 {meals.length} 件の記録
        </span>
      </div>

      {mealSlots.map((slot) => {
        const slotConfig = MEAL_TYPE_CONFIG[slot];
        const slotMeals = meals.filter((m) => m.mealType === slot);
        const slotCalories = slotMeals.reduce((acc, m) => acc + (m.calories || 0), 0);

        return (
          <div
            key={slot}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
          >
            {/* Slot Header */}
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg" role="img" aria-label={slotConfig.label}>
                  {slotConfig.iconEmoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{slotConfig.label}</h3>
                    <span className="text-xs text-slate-700 font-medium">({slotMeals.length}件)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {slotCalories > 0 && (
                  <span className="text-xs font-bold text-slate-700 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                    合計 {slotCalories.toLocaleString()} kcal
                  </span>
                )}
                <button
                  id={`slot-add-btn-${slot}`}
                  type="button"
                  onClick={() => onAddMealForSlot(slot)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>記録を追加</span>
                </button>
              </div>
            </div>

            {/* Meals in this slot */}
            <div className="p-4">
              {slotMeals.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                  <p className="text-xs text-slate-700 mb-2">
                    {slotConfig.label}の記録はまだありません
                  </p>
                  <button
                    id={`empty-slot-add-btn-${slot}`}
                    type="button"
                    onClick={() => onAddMealForSlot(slot)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>写真を撮って自動解析</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {slotMeals.map((meal) => {
                    const isExpanded = !!expandedMealIds[meal.id];

                    return (
                      <div
                        key={meal.id}
                        className="rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-all bg-white"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* Left: Thumbnail & Title */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {meal.imageUrl ? (
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                {meal.imageUrl.startsWith("<svg") ? (
                                  <div
                                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                                    dangerouslySetInnerHTML={{ __html: meal.imageUrl }}
                                  />
                                ) : (
                                  <img
                                    src={meal.imageUrl}
                                    alt={meal.dishName}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0">
                                🍱
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {meal.time}
                                </span>
                                {meal.dietScore && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    スコア {meal.dietScore}点
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {meal.dishName}
                              </h4>

                              {meal.summary && (
                                <p className="text-xs text-slate-700 line-clamp-1 mt-0.5">
                                  {meal.summary}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Calories & PFC Pills & Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-right">
                              <div className="text-base font-extrabold text-slate-900">
                                {meal.calories}{" "}
                                <span className="text-xs font-normal text-slate-700">kcal</span>
                              </div>
                              {/* PFC small tags */}
                              <div className="flex items-center gap-1 mt-0.5">
                                <span
                                  title={`たんぱく質 ${meal.protein}g (${meal.pfcRatio.proteinPercent}%)`}
                                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  P:{meal.protein}g
                                </span>
                                <span
                                  title={`脂質 ${meal.fat}g (${meal.pfcRatio.fatPercent}%)`}
                                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200"
                                >
                                  F:{meal.fat}g
                                </span>
                                <span
                                  title={`炭水化物 ${meal.carbs}g (${meal.pfcRatio.carbPercent}%)`}
                                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200"
                                >
                                  C:{meal.carbs}g
                                </span>
                              </div>
                            </div>

                            {/* Details toggle & delete & LINE Reply */}
                            <div className="flex items-center gap-1.5">
                              {onOpenLineReply && (
                                <button
                                  type="button"
                                  id={`line-reply-btn-${meal.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLineReply(meal);
                                  }}
                                  title="この食事のLINE返信文を作成・確認"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-[#06C755] hover:text-white border border-emerald-200 transition-all shadow-2xs group"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-[#06C755] group-hover:text-white" />
                                  <span className="hidden sm:inline">LINE返信</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => toggleExpand(meal.id)}
                                title={isExpanded ? "詳細を閉じる" : "詳細を表示"}
                                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                id={`delete-meal-btn-${meal.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMealToDelete(meal);
                                }}
                                title="この食事記録を削除"
                                aria-label="この食事記録を削除"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded details (Food items breakdown, AI Advice, LINE Reply Draft) */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-3">
                            {/* Food items breakdown */}
                            {meal.foodItems && meal.foodItems.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-slate-700 mb-1.5">
                                  品目・食材の内訳:
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-lg">
                                  {meal.foodItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-[11px] py-1 px-1.5 rounded bg-white border border-slate-100"
                                    >
                                      <span className="font-medium text-slate-800 truncate">
                                        {item.name}
                                        {item.portion && (
                                          <span className="text-slate-600 font-normal ml-1">
                                            ({item.portion})
                                          </span>
                                        )}
                                      </span>
                                      <span className="font-bold text-slate-700 shrink-0 ml-2">
                                        {item.calories} kcal
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Diet Advice */}
                            {meal.dietAdvice && (
                              <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-100 flex items-start gap-2 text-emerald-900">
                                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block text-[11px] text-emerald-800">
                                    管理栄養士AIのアドバイス:
                                  </span>
                                  <p className="text-xs leading-relaxed text-emerald-950 mt-0.5">
                                    {meal.dietAdvice}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* LINE Reply Box in expanded view */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-emerald-200/70 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-[#06C755]" />
                                  <span>会員様へのLINE返信案</span>
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {meal.lineReplyDraft ? (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDirectCopy(meal, e)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        copiedMealId === meal.id
                                          ? "bg-emerald-700 text-white"
                                          : "bg-[#06C755] text-white hover:bg-[#05b34c]"
                                      }`}
                                    >
                                      {copiedMealId === meal.id ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>コピー完了！</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>コピー</span>
                                        </>
                                      )}
                                    </button>
                                  ) : null}

                                  {onOpenLineReply && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenLineReply(meal)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                                    >
                                      {meal.lineReplyDraft ? "編集・トーン変更" : "AIでLINE返信文を生成"}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {meal.lineReplyDraft ? (
                                <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                                  {meal.lineReplyDraft}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 italic bg-white/60 p-2.5 rounded-lg border border-slate-200/60">
                                  まだLINE返信文が生成されていません。「AIでLINE返信文を生成」から会員様の代謝タイプに合わせたメッセージを作成できます。
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* In-App Delete Confirmation Modal (Reliable in iFrame) */}
      {mealToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setMealToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setMealToDelete(null)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                食事記録を削除しますか？
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                「<strong className="text-slate-900">{mealToDelete.dishName}</strong>」（{mealToDelete.calories} kcal）の記録を削除します。
              </p>
              <p className="text-[11px] text-slate-700 mt-1">
                ※本日の総カロリーやPFCバランスの集計から除外されます。
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                id="cancel-delete-meal-btn"
                onClick={() => setMealToDelete(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                id="confirm-delete-meal-btn"
                onClick={() => {
                  const id = mealToDelete.id;
                  setMealToDelete(null);
                  onDeleteMeal(id);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white transition-all shadow-xs"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
