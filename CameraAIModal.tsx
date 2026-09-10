import React, { useState, useRef, useEffect } from "react";
import { MealRecord, MealType, AIAnalysisResult, UserProfile } from "../types";
import { SAMPLE_MEAL_PRESETS, formatDate, getMetabolismInfo } from "../data/sampleData";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Utensils,
  Lightbulb,
  MessageSquare,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";

interface CameraAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  defaultMealType?: MealType;
  onSaveMeal: (meal: MealRecord) => void;
  activeUser?: UserProfile;
}

export const CameraAIModal: React.FC<CameraAIModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultMealType = "lunch",
  onSaveMeal,
  activeUser,
}) => {
  const [mode, setMode] = useState<"camera" | "upload" | "preset">("camera");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Form fields for saving
  const [dishName, setDishName] = useState<string>("");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [recordDate, setRecordDate] = useState<string>(defaultDate);
  const [recordTime, setRecordTime] = useState<string>("12:30");
  const [mealNote, setMealNote] = useState<string>("");
  const [lineReplyDraft, setLineReplyDraft] = useState<string>("");
  const [copiedLineReply, setCopiedLineReply] = useState<boolean>(false);
  const [isRegeneratingLine, setIsRegeneratingLine] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize time on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setRecordTime(`${hours}:${minutes}`);
      setRecordDate(defaultDate);
      setMealType(defaultMealType);
      resetState();
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, defaultDate, defaultMealType]);

  const resetState = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAnalysisResult(null);
    setDishName("");
    setCalories(0);
    setProtein(0);
    setFat(0);
    setCarbs(0);
    setMealNote("");
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("このブラウザはカメラアクセスをサポートしていません。ファイルアップロードをご利用ください。");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setMode("camera");
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(
        "カメラを起動できませんでした（アクセスが許可されていないか、他のアプリが使用中です）。写真のアップロードやサンプル写真をお試しください。"
      );
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeImageWithAI(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImageWithAI(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Convert SVG preset to raster PNG data URL for Gemini analysis
  const handleSelectPreset = (preset: (typeof SAMPLE_MEAL_PRESETS)[0]) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([preset.previewSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImageWithAI(dataUrl, preset.name);
    };
    img.src = url;
  };

  const analyzeImageWithAI = async (imageBase64: string, hint?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mealNote: [mealNote, hint].filter(Boolean).join(" "),
          mealType,
          metabolismType: activeUser?.metabolismType || "lipid",
          userName: activeUser?.name || "ユーザー",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI解析サーバーエラー (${response.status})`);
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || "食事情報の解析に失敗しました。");
      }

      const result: AIAnalysisResult = resJson.data;
      setAnalysisResult(result);
      setDishName(result.dishName);
      setCalories(result.calories);
      setProtein(result.protein);
      setFat(result.fat);
      setCarbs(result.carbs);
      setLineReplyDraft(result.lineReplyDraft || "");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setAnalysisError(err.message || "AI解析中にエラーが発生しました。再度お試しください。");
    } finally {
      setIsAnalyzing(false);
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

  const handleRegenerateLineReply = async (tone: string = "supportive") => {
    if (!dishName) return;
    setIsRegeneratingLine(true);
    try {
      const res = await fetch("/api/generate-line-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: activeUser?.name || "会員",
          metabolismType: activeUser?.metabolismType || "lipid",
          dishName: dishName || "お食事",
          calories,
          protein,
          fat,
          carbs,
          dietAdvice: analysisResult?.dietAdvice || "",
          tone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.replyText) {
          setLineReplyDraft(data.replyText);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingLine(false);
    }
  };

  const handleSave = () => {
    if (!dishName.trim()) return;

    const pKcal = protein * 4;
    const fKcal = fat * 9;
    const cKcal = carbs * 4;
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
      summary: analysisResult?.summary || "",
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fiber: analysisResult?.fiber,
      salt: analysisResult?.salt,
      pfcRatio: pfc,
      foodItems: analysisResult?.foodItems || [
        {
          name: dishName.trim(),
          portion: "1食分",
          calories: Math.round(calories),
          protein,
          fat,
          carbs,
        },
      ],
      dietScore: analysisResult?.dietScore || 85,
      dietAdvice: analysisResult?.dietAdvice || "",
      lineReplyDraft: lineReplyDraft.trim() || undefined,
      imageUrl: capturedImage || undefined,
      createdAt: Date.now(),
    };

    onSaveMeal(newRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  食事の写真をAI自動解析
                </h3>
                {activeUser && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    <span>{activeUser.avatarEmoji}</span>
                    <span>{activeUser.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-white/70 px-1.5 py-0.2 rounded-full">
                      {getMetabolismInfo(activeUser.metabolismType).subName}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700">
                写真を撮るだけで料理名・カロリー・PFCバランスを自動推定
              </p>
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Step 1: Capture / Upload / Preset Options */}
          {!capturedImage && (
            <div>
              {/* Method Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("camera");
                    startCamera();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === "camera"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>カメラで撮影</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("upload");
                    stopCamera();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === "upload"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>写真をアップロード</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("preset");
                    stopCamera();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === "preset"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>サンプル写真で試す</span>
                </button>
              </div>

              {/* Mode 1: Live Camera View */}
              {mode === "camera" && (
                <div className="space-y-3">
                  {cameraError ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p>{cameraError}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
                        >
                          カメラを再試行
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("upload")}
                          className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 font-semibold rounded-lg hover:bg-amber-50"
                        >
                          ファイルをアップロード
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover"
                      />

                      {/* Camera viewfinder guide */}
                      <div className="absolute inset-6 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex items-center justify-center">
                        <span className="bg-slate-900/60 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                          食事全体が枠内に収まるように撮影してください
                        </span>
                      </div>

                      {/* Shutter Button */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center">
                        <button
                          id="camera-shutter-btn"
                          type="button"
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full bg-white text-emerald-600 shadow-lg p-1 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-emerald-500"
                        >
                          <Camera className="w-7 h-7" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: File Upload */}
              {mode === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    写真をクリックして選択またはドラッグ＆ドロップ
                  </h4>
                  <p className="text-xs text-slate-700">
                    JPG, PNG, WebP対応 (スマホのカメラロールから選択できます)
                  </p>
                </div>
              )}

              {/* Mode 3: Preset Sample Photos */}
              {mode === "preset" && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-700">
                    写真撮影が難しい場合は、以下のリアルなサンプル食事をタップするだけでAI解析を即座に体験できます：
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SAMPLE_MEAL_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all bg-white flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-28 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-100">
                            <div
                              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                              dangerouslySetInnerHTML={{ __html: preset.previewSvg }}
                            />
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {preset.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                            {preset.name}
                          </h5>
                          <p className="text-[11px] text-slate-700 line-clamp-2 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-800">
                            約 {preset.expectedCal} kcal
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            AI解析する →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Captured Photo & Scanning Animation */}
          {capturedImage && (
            <div className="space-y-4">
              {/* Image Preview & Scanning Overlay */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 max-h-64 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured Meal"
                  className="w-full h-full max-h-64 object-contain"
                />

                {/* Retake Button */}
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    startCamera();
                  }}
                  disabled={isAnalyzing}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs font-medium hover:bg-slate-900 backdrop-blur-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>撮り直す</span>
                </button>

                {/* AI Scanning Visual Effect */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative w-16 h-16 mb-3">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping" />
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                      <Sparkles className="w-6 h-6 text-emerald-300 absolute inset-0 m-auto" />
                    </div>
                    <span className="text-sm font-bold text-white mb-1">
                      Gemini AIが食事を画像解析中...
                    </span>
                    <p className="text-xs text-emerald-200 max-w-sm">
                      料理の特定、食材分量、カロリー、PFC栄養素の割合を精密に推測しています
                    </p>
                  </div>
                )}
              </div>

              {/* Analysis Error Message */}
              {analysisError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">解析に失敗しました:</span>
                    <p className="mt-0.5">{analysisError}</p>
                    <button
                      type="button"
                      onClick={() => analyzeImageWithAI(capturedImage)}
                      className="mt-2 text-xs font-bold text-rose-700 underline"
                    >
                      もう一度解析を試す
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Result Card & Editable Form */}
              {analysisResult && !isAnalyzing && (
                <div className="space-y-4 pt-1">
                  {/* Recognized Badge */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">
                        AI解析完了（日本の食品標準成分表基準）
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      ダイエットスコア {analysisResult.dietScore}点
                    </span>
                  </div>

                  {/* Dish Name & Calorie Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        推測された料理名 (修正可能)
                      </label>
                      <input
                        type="text"
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="料理名を入力"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        総カロリー (kcal)
                      </label>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-extrabold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* PFC Macro Inputs & Ratio Pills */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        推測されたPFCバランス (グラム数)
                      </label>
                      <span className="text-[11px] text-slate-700">
                        比率: P:{analysisResult.pfcRatio.proteinPercent}% / F:
                        {analysisResult.pfcRatio.fatPercent}% / C:
                        {analysisResult.pfcRatio.carbPercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                        <span className="block text-[11px] font-bold text-blue-700 mb-1">
                          たんぱく質 (P)
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={protein}
                            onChange={(e) => setProtein(Number(e.target.value))}
                            className="w-full bg-white px-2 py-1 text-sm font-bold text-blue-900 rounded-lg border border-blue-200"
                          />
                          <span className="text-xs text-blue-700">g</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="block text-[11px] font-bold text-amber-700 mb-1">
                          脂質 (F)
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={fat}
                            onChange={(e) => setFat(Number(e.target.value))}
                            className="w-full bg-white px-2 py-1 text-sm font-bold text-amber-900 rounded-lg border border-amber-200"
                          />
                          <span className="text-xs text-amber-700">g</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                        <span className="block text-[11px] font-bold text-rose-700 mb-1">
                          炭水化物 (C)
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={carbs}
                            onChange={(e) => setCarbs(Number(e.target.value))}
                            className="w-full bg-white px-2 py-1 text-sm font-bold text-rose-900 rounded-lg border border-rose-200"
                          />
                          <span className="text-xs text-rose-700">g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients breakdown list */}
                  {analysisResult.foodItems && analysisResult.foodItems.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-800 block mb-2">
                        検出された食材・料理の内訳:
                      </span>
                      <div className="space-y-1">
                        {analysisResult.foodItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs py-1 px-2 rounded bg-white border border-slate-100"
                          >
                            <span className="font-medium text-slate-800">
                              {item.name}
                              <span className="text-slate-600 text-[11px] ml-1">
                                ({item.portion})
                              </span>
                            </span>
                            <span className="font-bold text-slate-700">
                              {item.calories} kcal (P:{item.protein}g / F:{item.fat}g / C:{item.carbs}g)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dietitian Advice */}
                  {analysisResult.dietAdvice && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                      <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-emerald-900">
                            管理栄養士からの体質別アドバイス:
                          </span>
                          {activeUser && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
                              {getMetabolismInfo(activeUser.metabolismType).title} ({getMetabolismInfo(activeUser.metabolismType).subName})
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 leading-relaxed">{analysisResult.dietAdvice}</p>
                      </div>
                    </div>
                  )}

                  {/* LINE Reply Message Generator Section */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#06C755] text-white flex items-center justify-center text-xs shadow-xs">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            会員様へのLINE返信メッセージ案
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
                            (コピペしてLINE返信に使用)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyLineReply}
                          disabled={!lineReplyDraft.trim()}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                            copiedLineReply
                              ? "bg-emerald-700 ring-2 ring-emerald-300"
                              : "bg-[#06C755] hover:bg-[#05b34c]"
                          }`}
                        >
                          {copiedLineReply ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>コピーしました！</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>返信文をコピー</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Tone fast switcher */}
                    <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-0.5">
                      <span className="text-slate-500 shrink-0 font-medium">トーン切替:</span>
                      <button
                        type="button"
                        onClick={() => handleRegenerateLineReply("supportive")}
                        disabled={isRegeneratingLine}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 disabled:opacity-50"
                      >
                        🤝 丁寧＆親身
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerateLineReply("positive")}
                        disabled={isRegeneratingLine}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 disabled:opacity-50"
                      >
                        🎉 褒めて伸ばす
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerateLineReply("concise")}
                        disabled={isRegeneratingLine}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 disabled:opacity-50"
                      >
                        ⚡ 簡潔クイック
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerateLineReply("logical")}
                        disabled={isRegeneratingLine}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 disabled:opacity-50"
                      >
                        📊 論理的・PFC
                      </button>
                    </div>

                    {/* Speech bubble textarea */}
                    <div className="bg-white rounded-xl border border-emerald-200/80 p-2.5 relative shadow-2xs">
                      {isRegeneratingLine ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>LINE返信メッセージを再生成中...</span>
                        </div>
                      ) : (
                        <textarea
                          rows={4}
                          value={lineReplyDraft}
                          onChange={(e) => setLineReplyDraft(e.target.value)}
                          placeholder="LINE返信メッセージ案がここに表示されます。自由に編集できます。"
                          className="w-full bg-transparent resize-y border-none focus:outline-none text-xs text-slate-800 leading-relaxed placeholder:text-slate-400"
                        />
                      )}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>✏️ 直接文面を加筆・修正できます</span>
                        <span>{lineReplyDraft.length}文字</span>
                      </div>
                    </div>
                  </div>

                  {/* Meal Slot, Date, Time selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        食事の分類
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as MealType)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="breakfast">朝食 (Breakfast)</option>
                        <option value="lunch">昼食 (Lunch)</option>
                        <option value="dinner">夕食 (Dinner)</option>
                        <option value="snack">間食 (Snack)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        記録日
                      </label>
                      <input
                        type="date"
                        value={recordDate}
                        onChange={(e) => setRecordDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        時間
                      </label>
                      <input
                        type="time"
                        value={recordTime}
                        onChange={(e) => setRecordTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            キャンセル
          </button>

          {analysisResult && !isAnalyzing && (
            <button
              id="save-ai-meal-btn"
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>この食事を記録する</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
