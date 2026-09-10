import React, { useState } from "react";
import { UserProfile, DietMode, PFCRatio, MetabolismType } from "../types";
import { METABOLISM_TYPES, getMetabolismInfo, DIET_PRESETS } from "../data/sampleData";
import {
  Users,
  Plus,
  Check,
  Trash2,
  Edit2,
  X,
  Sparkles,
  UserCheck,
  BookOpen,
  Info,
  Flame,
  Dumbbell,
  HeartHandshake,
  Apple,
  Filter,
  ArrowRight,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeUserId: string;
  onSelectUser: (id: string) => void;
  onAddUser: (profile: Omit<UserProfile, "id" | "createdAt">) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (id: string) => void;
  mealCountsByUser: Record<string, number>;
}

const EMOJI_OPTIONS = ["🥑", "🍚", "💪", "🧘", "🔥", "👤", "🏃", "🥗", "🚴", "🏊", "👨‍🍳", "👩‍💼"];

const COLOR_OPTIONS: {
  id: UserProfile["themeColor"];
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}[] = [
  { id: "amber", label: "アンバー", bgClass: "bg-amber-100", textClass: "text-amber-700", borderClass: "border-amber-500" },
  { id: "rose", label: "ローズ", bgClass: "bg-rose-100", textClass: "text-rose-700", borderClass: "border-rose-500" },
  { id: "blue", label: "ブルー", bgClass: "bg-blue-100", textClass: "text-blue-700", borderClass: "border-blue-500" },
  { id: "purple", label: "パープル", bgClass: "bg-purple-100", textClass: "text-purple-700", borderClass: "border-purple-500" },
  { id: "emerald", label: "エメラルド", bgClass: "bg-emerald-100", textClass: "text-emerald-700", borderClass: "border-emerald-500" },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeUserId,
  onSelectUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  mealCountsByUser,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "guide">("list");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Filter in list view by metabolism type
  const [metabolismFilter, setMetabolismFilter] = useState<MetabolismType | "all">("all");

  // Form State
  const [name, setName] = useState("");
  const [metabolismType, setMetabolismType] = useState<MetabolismType>("lipid");
  const [avatarEmoji, setAvatarEmoji] = useState("🥑");
  const [themeColor, setThemeColor] = useState<UserProfile["themeColor"]>("amber");
  const [targetCalories, setTargetCalories] = useState(1800);
  const [dietMode, setDietMode] = useState<DietMode>("custom");
  const [pfcRatio, setPfcRatio] = useState<PFCRatio>(METABOLISM_TYPES.lipid.recommendedPfc);
  const [notes, setNotes] = useState("");

  // Delete Confirm State
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleOpenCreate = (initialType?: MetabolismType) => {
    const selectedType = initialType || "lipid";
    const metaInfo = METABOLISM_TYPES[selectedType];

    // Determine smart default name
    const existingNames = profiles.map((p) => p.name);
    const candidateNames = ["Aさん", "Bさん", "Cさん", "Dさん", "Eさん", "Fさん"];
    const defaultName = candidateNames.find((n) => !existingNames.includes(n)) || `ユーザー${profiles.length + 1}`;

    setName(defaultName);
    setMetabolismType(selectedType);
    setAvatarEmoji(metaInfo.icon);
    setThemeColor(
      selectedType === "lipid" ? "amber" :
      selectedType === "carb" ? "rose" :
      selectedType === "muscle" ? "blue" :
      selectedType === "stress" ? "purple" : "emerald"
    );
    setTargetCalories(selectedType === "muscle" ? 2200 : selectedType === "carb" ? 1950 : 1800);
    setDietMode(
      selectedType === "carb" ? "low-carb" :
      selectedType === "muscle" ? "high-protein" : "custom"
    );
    setPfcRatio(metaInfo.recommendedPfc);
    setNotes(metaInfo.advice);
    setViewMode("create");
  };

  const handleOpenEdit = (profile: UserProfile) => {
    setEditingUserId(profile.id);
    setName(profile.name);
    const mType = profile.metabolismType || "lipid";
    setMetabolismType(mType);
    setAvatarEmoji(profile.avatarEmoji);
    setThemeColor(profile.themeColor);
    setTargetCalories(profile.goal.targetCalories);
    setDietMode(profile.goal.dietMode);
    setPfcRatio(profile.goal.targetPfcRatio);
    setNotes(profile.notes || METABOLISM_TYPES[mType].advice);
    setViewMode("edit");
  };

  const handleSelectMetabolismType = (type: MetabolismType) => {
    setMetabolismType(type);
    const metaInfo = METABOLISM_TYPES[type];
    setAvatarEmoji(metaInfo.icon);
    setPfcRatio(metaInfo.recommendedPfc);
    setNotes(metaInfo.advice);

    if (type === "lipid") {
      setThemeColor("amber");
      setDietMode("custom");
    } else if (type === "carb") {
      setThemeColor("rose");
      setDietMode("low-carb");
    } else if (type === "muscle") {
      setThemeColor("blue");
      setDietMode("high-protein");
    } else if (type === "stress") {
      setThemeColor("purple");
      setDietMode("balanced");
    } else if (type === "hypometabolism") {
      setThemeColor("emerald");
      setDietMode("balanced");
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddUser({
      name: name.trim(),
      metabolismType,
      avatarEmoji,
      themeColor,
      notes: notes.trim(),
      goal: {
        targetCalories: Math.max(800, Math.min(5000, targetCalories)),
        dietMode,
        targetPfcRatio: pfcRatio,
      },
    });
    setViewMode("list");
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !name.trim()) return;

    const currentProfile = profiles.find((p) => p.id === editingUserId);
    if (!currentProfile) return;

    onUpdateUser(editingUserId, {
      name: name.trim(),
      metabolismType,
      avatarEmoji,
      themeColor,
      notes: notes.trim(),
      goal: {
        ...currentProfile.goal,
        targetCalories: Math.max(800, Math.min(5000, targetCalories)),
        dietMode,
        targetPfcRatio: pfcRatio,
      },
    });
    setViewMode("list");
  };

  const filteredProfiles = profiles.filter((p) => {
    if (metabolismFilter === "all") return true;
    return p.metabolismType === metabolismFilter;
  });

  const metabolismOrder: MetabolismType[] = ["lipid", "carb", "muscle", "stress", "hypometabolism"];

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
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {viewMode === "list" && "代謝タイプ別ユーザー管理"}
                  {viewMode === "create" && "新しいユーザーを登録 (代謝タイプ設定)"}
                  {viewMode === "edit" && "ユーザー設定・代謝タイプの編集"}
                  {viewMode === "guide" && "5つの代謝タイプの特徴・食事ガイド"}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                {viewMode === "list" && "脂質・糖質・筋肉・ストレス・低代謝の5つの体質タイプ別にユーザーを個別管理"}
                {viewMode === "create" && "体質に合わせて推奨PFCバランスとAIアドバイスを最適化します"}
                {viewMode === "edit" && "表示名や代謝タイプ、目標摂取カロリーを変更します"}
                {viewMode === "guide" && "それぞれの代謝タイプに特化した太りやすい原因と栄養戦略"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {viewMode === "list" && (
              <button
                type="button"
                onClick={() => setViewMode("guide")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                title="代謝タイプ解説ガイド"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">タイプ解説</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* VIEW: List */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {/* Top Action & Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-bold text-slate-800">
                  登録済みユーザー ({profiles.length}名)
                </span>
                <button
                  type="button"
                  id="add-new-user-btn"
                  onClick={() => handleOpenCreate()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新規ユーザーを追加</span>
                </button>
              </div>

              {/* Metabolism Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMetabolismFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors ${
                    metabolismFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  すべて ({profiles.length})
                </button>
                {metabolismOrder.map((typeKey) => {
                  const meta = METABOLISM_TYPES[typeKey];
                  const count = profiles.filter((p) => p.metabolismType === typeKey).length;
                  const isSelected = metabolismFilter === typeKey;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => setMetabolismFilter(typeKey)}
                      className={`px-2.5 py-1.5 rounded-xl font-semibold shrink-0 flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.shortTitle}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Profiles List */}
              <div className="space-y-3">
                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">この代謝タイプのユーザーはまだ登録されていません。</p>
                    <button
                      type="button"
                      onClick={() => handleOpenCreate(metabolismFilter === "all" ? "lipid" : metabolismFilter)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{metabolismFilter === "all" ? "ユーザーを追加" : `${METABOLISM_TYPES[metabolismFilter].shortTitle}のユーザーを追加`}</span>
                    </button>
                  </div>
                ) : (
                  filteredProfiles.map((p) => {
                    const isActive = p.id === activeUserId;
                    const meta = getMetabolismInfo(p.metabolismType || "lipid");
                    const mealCount = mealCountsByUser[p.id] || 0;
                    const pfc = p.goal.targetPfcRatio;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: User Info & Metabolism Type */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                              {p.avatarEmoji || meta.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {p.name}
                                </h4>
                                {isActive && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                    <UserCheck className="w-3 h-3" />
                                    現在選択中
                                  </span>
                                )}
                              </div>

                              {/* Metabolism Badge */}
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${meta.colorClass}`}>
                                  <span>{meta.icon}</span>
                                  <span>{meta.title}</span>
                                  <span className="opacity-90 font-medium text-[10px]">({meta.subName})</span>
                                </span>
                              </div>

                              {/* Goal info & PFC */}
                              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 flex-wrap">
                                <span className="font-semibold text-slate-800">
                                  目標: {p.goal.targetCalories.toLocaleString()} kcal
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-[11px] text-slate-500">
                                  PFC目安: P{pfc.proteinPercent}% / F{pfc.fatPercent}% / C{pfc.carbPercent}%
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-[11px] text-slate-500">
                                  記録: <strong className="text-slate-700">{mealCount}件</strong>
                                </span>
                              </div>

                              {/* Notes/Advice snippet */}
                              {p.notes && (
                                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                  💡 {p.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 justify-end border-slate-100">
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectUser(p.id);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                              >
                                切り替える
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="設定・目標の編集"
                              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {profiles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(p)}
                                title="ユーザー削除"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Metabolism Types Feature Notice */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-2xl border border-emerald-200/80 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>代謝タイプによるパーソナライズ管理:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  各ユーザーの体質（脂質代謝・糖質・筋肉が付きにくい・ストレス・低代謝）に応じて、AIカメラ解析時の管理栄養士アドバイスや推奨PFC目標が最適化されます。切り替えてもデータは個別に安全に保存されます。
                </p>
              </div>
            </div>
          )}

          {/* VIEW: Guide (5 Metabolism Types Explained) */}
          {viewMode === "guide" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  5つの代謝タイプの特徴と栄養戦略
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  ユーザー一覧に戻る
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {metabolismOrder.map((typeKey) => {
                  const meta = METABOLISM_TYPES[typeKey];
                  return (
                    <div
                      key={typeKey}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{meta.icon}</span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {meta.title}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {meta.subName}
                            </span>
                          </div>
                        </div>

                        <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${meta.colorClass}`}>
                          推奨: P{meta.recommendedPfc.proteinPercent}% / F{meta.recommendedPfc.fatPercent}% / C{meta.recommendedPfc.carbPercent}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {meta.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100 text-amber-900">
                          <strong>⚠️ 太りやすい原因:</strong> {meta.cause}
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                          <strong>🥗 実践アドバイス:</strong> {meta.advice}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">
                          おすすめ食材: {meta.recommendedFoods.slice(0, 3).join(", ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenCreate(typeKey)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <span>このタイプでユーザーを作成</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  ユーザー一覧に戻る
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Create or Edit User */}
          {(viewMode === "create" || viewMode === "edit") && (
            <form onSubmit={viewMode === "create" ? handleSubmitCreate : handleSubmitEdit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  お名前・ニックネーム <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: Aさん, Bさん, 佐藤さん"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Metabolism Type Selection (Core Requirement) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>代謝タイプ (5つの体質分類)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    選択すると推奨PFCとアドバイスが自動連動します
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {metabolismOrder.map((mKey) => {
                    const meta = METABOLISM_TYPES[mKey];
                    const isSelected = metabolismType === mKey;
                    return (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => handleSelectMetabolismType(mKey)}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/25 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl shrink-0 mt-0.5">{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                {meta.title}
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-800 block mt-0.5">
                              {meta.subName}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              P:{meta.recommendedPfc.proteinPercent}% / F:{meta.recommendedPfc.fatPercent}% / C:{meta.recommendedPfc.carbPercent}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Metabolism Info Card */}
              {metabolismType && (
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${METABOLISM_TYPES[metabolismType].colorClass}`}>
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{METABOLISM_TYPES[metabolismType].icon}</span>
                      <span>{METABOLISM_TYPES[metabolismType].title}の特徴・食事方針</span>
                    </span>
                    <span className="text-[10px] font-semibold opacity-80">
                      推奨比率自動反映済
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {METABOLISM_TYPES[metabolismType].description}
                  </p>
                  <div className="text-[11px] pt-1">
                    <strong>🥗 重点アドバイス:</strong> {METABOLISM_TYPES[metabolismType].advice}
                  </div>
                </div>
              )}

              {/* Avatar Emoji & Theme Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    アイコン・アバター
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition-all ${
                          avatarEmoji === emoji
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30 scale-105"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    テーマカラー
                  </label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setThemeColor(c.id)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${c.bgClass} ${
                          themeColor === c.id ? `ring-2 ring-offset-1 ${c.borderClass}` : "border-slate-200"
                        }`}
                        title={c.label}
                      >
                        {themeColor === c.id && <Check className={`w-3.5 h-3.5 ${c.textClass}`} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Calories */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    1日の目標摂取カロリー
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {targetCalories.toLocaleString()} kcal
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3500"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-700 mt-1">
                  <span>1,200 kcal</span>
                  <span>1,800 kcal (脂質・低代謝)</span>
                  <span>2,200 kcal (筋肉タイプ)</span>
                  <span>3,500 kcal</span>
                </div>
              </div>

              {/* Target PFC Ratio Fine-Tuning */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    目標PFCバランス割合 (%)
                  </label>
                  <span className={`text-[11px] font-bold ${
                    pfcRatio.proteinPercent + pfcRatio.fatPercent + pfcRatio.carbPercent === 100
                      ? "text-emerald-700"
                      : "text-rose-600"
                  }`}>
                    合計: {pfcRatio.proteinPercent + pfcRatio.fatPercent + pfcRatio.carbPercent}%
                    {pfcRatio.proteinPercent + pfcRatio.fatPercent + pfcRatio.carbPercent !== 100 && " (100%に調整してください)"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="block text-[11px] font-bold text-blue-800 mb-1">
                      たんぱく質 (P)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={pfcRatio.proteinPercent}
                        onChange={(e) =>
                          setPfcRatio({ ...pfcRatio, proteinPercent: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-white px-2 py-1 text-xs font-bold text-blue-900 rounded-lg border border-blue-200"
                      />
                      <span className="text-xs text-blue-700">%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="block text-[11px] font-bold text-amber-800 mb-1">
                      脂質 (F)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={pfcRatio.fatPercent}
                        onChange={(e) =>
                          setPfcRatio({ ...pfcRatio, fatPercent: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-white px-2 py-1 text-xs font-bold text-amber-900 rounded-lg border border-amber-200"
                      />
                      <span className="text-xs text-amber-700">%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="block text-[11px] font-bold text-rose-800 mb-1">
                      炭水化物 (C)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="5"
                        max="80"
                        value={pfcRatio.carbPercent}
                        onChange={(e) =>
                          setPfcRatio({ ...pfcRatio, carbPercent: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-white px-2 py-1 text-xs font-bold text-rose-900 rounded-lg border border-rose-200"
                      />
                      <span className="text-xs text-rose-700">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes / Personalized Memo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  体質メモ・個別アドバイス目標
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例: 脂質で太りやすいため揚げ物を控え、蒸し料理を優先する。"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-bold text-white transition-all shadow-sm"
                >
                  {viewMode === "create" ? "この代謝タイプで登録する" : "変更を保存する"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setUserToDelete(null)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">
                  ユーザー「{userToDelete.name}」を削除しますか？
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  このユーザーと関連する食事記録({mealCountsByUser[userToDelete.id] || 0}件)が完全に削除されます。この操作は取り消せません。
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = userToDelete.id;
                    setUserToDelete(null);
                    onDeleteUser(id);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
