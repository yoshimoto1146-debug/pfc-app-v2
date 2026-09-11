import React, { useState, useEffect, useMemo } from "react";
import { MealRecord, UserDietGoal, MealType, UserProfile } from "./types";
import {
  loadMeals,
  saveMeals,
  loadProfiles,
  saveProfiles,
  loadActiveUserId,
  saveActiveUserId,
  DEFAULT_PROFILES,
  getDailySummary,
} from "./storage";
import { formatDate, generateInitialMeals, generateSampleMealsForUserB } from "./sampleData";
import { Header } from "./Header";
import { TodaySummary } from "./TodaySummary";
import { MealList } from "./MealList";
import { AnalysisGraphView } from "./AnalysisGraphView";
import { CameraAIModal } from "./CameraAIModal";
import { GoalSettingsModal } from "./GoalSettingsModal";
import { ManualAddModal } from "./ManualAddModal";
import { UserProfileModal } from "./UserProfileModal";
import { LineReplyModal } from "./LineReplyModal";
import { CheckCircle2, Sparkles, Camera, BarChart3, RotateCcw, Smartphone, MessageSquare } from "lucide-react";

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => loadProfiles());
  const [activeUserId, setActiveUserId] = useState<string>(() => loadActiveUserId(profiles));
  const [meals, setMeals] = useState<MealRecord[]>(() => loadMeals());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [activeTab, setActiveTab] = useState<"today" | "analysis">("today");

  // Active User & Goal
  const activeUser = useMemo(() => {
    return profiles.find((p) => p.id === activeUserId) || profiles[0] || DEFAULT_PROFILES[0];
  }, [profiles, activeUserId]);

  const activeGoal = activeUser.goal;

  // Modal States
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLineReplyModalOpen, setIsLineReplyModalOpen] = useState(false);
  const [selectedMealForReply, setSelectedMealForReply] = useState<MealRecord | null>(null);
  const [targetSlot, setTargetSlot] = useState<MealType>("lunch");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Synchronize to localStorage
  useEffect(() => {
    saveMeals(meals);
  }, [meals]);

  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveActiveUserId(activeUserId);
  }, [activeUserId]);

  // Isolate meals for the currently active user
  const userMeals = useMemo(() => {
    return meals.filter((m) => (m.userId || profiles[0]?.id || "user_a") === activeUser.id);
  }, [meals, activeUser.id, profiles]);

  // Meal counts by user for modal view
  const mealCountsByUser = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of meals) {
      const uId = m.userId || profiles[0]?.id || "user_a";
      counts[uId] = (counts[uId] || 0) + 1;
    }
    return counts;
  }, [meals, profiles]);

  // User Management Handlers
  const handleSelectUser = (id: string) => {
    setActiveUserId(id);
    const target = profiles.find((p) => p.id === id);
    if (target) {
      showToast(`「${target.name}」のデータに切り替えました。`);
    }
  };

  const handleAddUser = (newProfileData: Omit<UserProfile, "id" | "createdAt">) => {
    const newId = `user_${Date.now()}`;
    const newProfile: UserProfile = {
      ...newProfileData,
      id: newId,
      createdAt: Date.now(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveUserId(newId);
    showToast(`新しいユーザー「${newProfile.name}」を登録し、切り替えました！`);
  };

  const handleUpdateUser = (id: string, updates: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast("ユーザー情報を更新しました。");
  };

  const handleDeleteUser = (id: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    setMeals((prev) => prev.filter((m) => (m.userId || "user_a") !== id));
    if (activeUserId === id) {
      setActiveUserId(remaining[0].id);
    }
    showToast("ユーザーと関連記録を削除しました。");
  };

  const handleSaveGoal = (newGoal: UserDietGoal) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeUser.id ? { ...p, goal: newGoal } : p))
    );
    showToast(`${activeUser.name}の目標カロリーとPFC設定を保存しました。`);
  };

  // Meal Handlers
  const handleSaveMeal = (newMeal: MealRecord) => {
    const mealWithUser: MealRecord = {
      ...newMeal,
      userId: activeUser.id,
    };
    setMeals((prev) => [mealWithUser, ...prev]);
    showToast(`「${mealWithUser.dishName}」(${mealWithUser.calories}kcal) を${activeUser.name}の記録に保存しました！`);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    showToast("食事記録を削除しました。");
  };

  const handleOpenAiCameraForSlot = (slot: MealType) => {
    setTargetSlot(slot);
    setIsCameraModalOpen(true);
  };

  const handleOpenManualAddForSlot = (slot: MealType) => {
    setTargetSlot(slot);
    setIsManualModalOpen(true);
  };

  const handleOpenLineReply = (meal: MealRecord) => {
    setSelectedMealForReply(meal);
    setIsLineReplyModalOpen(true);
  };

  const handleSaveReplyDraft = (mealId: string, replyText: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, lineReplyDraft: replyText } : m))
    );
    showToast("LINE返信文を保存しました！");
  };

  const handleConfirmReset = () => {
    const initialA = generateInitialMeals().map((m) => ({ ...m, userId: "user_a" }));
    const initialB = generateSampleMealsForUserB();
    const combined = [...initialA, ...initialB];
    setMeals(combined);
    saveMeals(combined);
    setProfiles(DEFAULT_PROFILES);
    saveProfiles(DEFAULT_PROFILES);
    setActiveUserId(DEFAULT_PROFILES[0].id);
    setIsResetModalOpen(false);
    showToast("サンプルデータ（Aさん・Bさん）を復元しました。");
  };

  // Compute daily summary for currently selected date and active user
  const daySummary = getDailySummary(userMeals, selectedDate);
  const dayMeals = userMeals.filter((m) => m.date === selectedDate);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with User Selector */}
      <Header
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenGoalSettings={() => setIsGoalModalOpen(true)}
        onOpenAiCamera={() => handleOpenAiCameraForSlot("lunch")}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeUser={activeUser}
        profiles={profiles}
        onSelectUser={handleSelectUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === "today" ? (
          <div>
            {/* Today's Calorie & PFC Summary Card */}
            <TodaySummary
              summary={daySummary}
              goal={activeGoal}
              activeUser={activeUser}
              onOpenAiCamera={() => handleOpenAiCameraForSlot("lunch")}
              onOpenManualAdd={() => handleOpenManualAddForSlot("lunch")}
            />

            {/* LINE Reply Quick Assist Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">LINE返信アシスト機能</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06C755] text-white">
                      即座にコピペ対応
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                    会員様がLINEで送ってきた食事写真・メニューをAI解析し、{activeUser.name}様（{activeUser.metabolismType === "lipid" ? "脂質代謝タイプ" : activeUser.metabolismType === "carb" ? "糖質タイプ" : activeUser.metabolismType === "muscle" ? "筋肉が付きにくいタイプ" : activeUser.metabolismType === "stress" ? "ストレスタイプ" : "低代謝タイプ"}）に合わせた返信メッセージ文を自動作成。そのままコピーしてLINEに送信できます。
                  </p>
                </div>
              </div>

              {dayMeals.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenLineReply(dayMeals[0])}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#06C755]" />
                  <span>最新の食事でLINE返信作成</span>
                </button>
              )}
            </div>

            {/* Meal Slots List */}
            <MealList
              meals={dayMeals}
              onDeleteMeal={handleDeleteMeal}
              onAddMealForSlot={handleOpenAiCameraForSlot}
              onOpenLineReply={handleOpenLineReply}
            />
          </div>
        ) : (
          /* Graph Analysis Tab */
          <AnalysisGraphView
            meals={userMeals}
            goal={activeGoal}
            activeUser={activeUser}
            onOpenGoalSettings={() => setIsGoalModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Bottom Quick Action Bar on Mobile */}
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => handleOpenAiCameraForSlot("lunch")}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>写真からAI解析</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "today" ? "analysis" : "today")}
          className="p-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs shadow-lg flex items-center justify-center"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            食事＆PFCバランス管理アプリ · 複数ユーザー管理対応 (選択中: <strong>{activeUser.name}</strong>)
          </p>
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>サンプルデータを再読み込み</span>
          </button>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                サンプルデータを再読み込みしますか？
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                現在の記録をリセットし、Aさん・Bさんのサンプルデータ（直近の食事記録および目標設定）を初期状態に復元します。
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors"
              >
                復元する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CameraAIModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        defaultDate={selectedDate}
        defaultMealType={targetSlot}
        onSaveMeal={handleSaveMeal}
        activeUser={activeUser}
      />

      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={activeGoal}
        userName={activeUser.name}
        onSaveGoal={handleSaveGoal}
      />

      <ManualAddModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultDate={selectedDate}
        defaultMealType={targetSlot}
        onSaveMeal={handleSaveMeal}
        activeUser={activeUser}
      />

      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        profiles={profiles}
        activeUserId={activeUserId}
        onSelectUser={handleSelectUser}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        mealCountsByUser={mealCountsByUser}
      />

      <LineReplyModal
        isOpen={isLineReplyModalOpen}
        onClose={() => {
          setIsLineReplyModalOpen(false);
          setSelectedMealForReply(null);
        }}
        meal={selectedMealForReply}
        activeUser={activeUser}
        onSaveReplyDraft={handleSaveReplyDraft}
      />
    </div>
  );
}
