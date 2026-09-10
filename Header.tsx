import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Utensils,
  Sparkles,
  Users,
  ChevronDown,
  Check,
  UserPlus,
} from "lucide-react";
import { formatDate, getMetabolismInfo } from "../data/sampleData";
import { UserProfile } from "../types";

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenGoalSettings: () => void;
  onOpenAiCamera: () => void;
  activeTab: "today" | "analysis";
  onChangeTab: (tab: "today" | "analysis") => void;
  activeUser: UserProfile;
  profiles: UserProfile[];
  onSelectUser: (id: string) => void;
  onOpenUserModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  onOpenGoalSettings,
  onOpenAiCamera,
  activeTab,
  onChangeTab,
  activeUser,
  profiles,
  onSelectUser,
  onOpenUserModal,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const todayStr = formatDate(new Date());
  const isToday = selectedDate === todayStr;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(formatDate(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(formatDate(d));
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  食事＆PFC管理
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  AI自動解析
                </span>
              </div>
              <p className="text-xs text-slate-700">カロリー＆栄養素自動記録・グラフ分析</p>
            </div>
          </div>

          {/* User Profile Switcher (Metabolism Type Aware) */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="header-user-switcher-btn"
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 transition-all shadow-xs"
              title="ユーザー切り替え・代謝タイプ管理"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-xs">
                {activeUser.avatarEmoji || getMetabolismInfo(activeUser.metabolismType).icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {activeUser.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold leading-tight">
                    {getMetabolismInfo(activeUser.metabolismType).shortTitle}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-[10px] text-slate-600 leading-none block mt-1">
                  {getMetabolismInfo(activeUser.metabolismType).subName} · {activeUser.goal.targetCalories.toLocaleString()} kcal
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>代謝タイプ別ユーザー</span>
                  <span className="text-[10px] text-emerald-600 font-normal">
                    全{profiles.length}人
                  </span>
                </div>

                <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                  {profiles.map((p) => {
                    const isSelected = p.id === activeUser.id;
                    const meta = getMetabolismInfo(p.metabolismType);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(p.id);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-xs">
                            {p.avatarEmoji || meta.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold truncate text-slate-900">
                                {p.name}
                              </p>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-700">
                                {meta.shortTitle}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {meta.subName} · {p.goal.targetCalories.toLocaleString()} kcal
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenUserModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                    <span>代謝タイプ別ユーザーの登録・管理</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Today's Logs vs Graph Analysis) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              id="tab-today-button"
              type="button"
              onClick={() => onChangeTab("today")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "today"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              本日の記録
            </button>
            <button
              id="tab-analysis-button"
              type="button"
              onClick={() => onChangeTab("analysis")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "analysis"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              グラフ分析
            </button>
          </div>

          {/* Actions: AI Camera & Goal Settings */}
          <div className="flex items-center gap-2">
            <button
              id="header-ai-camera-button"
              type="button"
              onClick={onOpenAiCamera}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>写真でAI解析</span>
            </button>

            <button
              id="header-goal-settings-button"
              type="button"
              onClick={onOpenGoalSettings}
              title={`${activeUser.name}の目標・PFC比率設定`}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Selector Strip (shown on today tab) */}
        {activeTab === "today" && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                id="date-prev-day-btn"
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="前日"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">
                  {formatDisplayDate(selectedDate)}
                </span>
                {isToday && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-white">
                    今日
                  </span>
                )}
              </div>

              <button
                id="date-next-day-btn"
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="翌日"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isToday && (
              <button
                id="date-jump-today-btn"
                type="button"
                onClick={() => onSelectDate(todayStr)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
              >
                今日に戻る
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
