import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGenAI(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient helper with retries and fallback for high demand (503)
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: any
) {
  const models = [params.model || "gemini-3.8-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          ...params,
          model,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Retry] Model ${model} attempt ${attempt} failed:`, err?.message || err);
        await new Promise((r) => setTimeout(r, 700 * attempt));
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Meal photos can be large base64 strings
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Meal Photo Analysis API
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = "image/jpeg",
        mealNote = "",
        metabolismType = "",
        userName = "",
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "画像データが提供されていません。" });
      }

      // Strip data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

      const ai = getGenAI();

      const metabolismGuideMap: Record<string, string> = {
        lipid: "【脂質代謝タイプ（脂質で太りやすい体質）】: 脂質の分解酵素が緩やかで皮下脂肪がつきやすい体質です。揚げ物や炒め油、洋菓子、脂身などの脂質割合に着目し、蒸す・煮る調理への切り替えや良質な油の選び方など、脂質コントロールの具体策をアドバイスに含めてください。",
        carb: "【糖質タイプ（糖質で太りやすい体質）】: 糖質の燃焼効率が低く血糖値が急上昇して内臓脂肪になりやすい体質です。白米・麺類・パン・甘いものの影響に配慮し、ベジファーストの徹底や低GI食材（玄米・もち麦・大豆等）の活用についてアドバイスを含めてください。",
        muscle: "【筋肉が付きにくいタイプ（ハードゲイナー）】: たんぱく質の分解が進みやすく筋肉や基礎代謝が落ちやすい体質です。毎食十分なたんぱく質（25〜30g目標）が摂れているか確認し、アミノ酸補給や筋肉維持に役立つ助言を含めてください。",
        stress: "【ストレスタイプ（自律神経・コルチゾール乱れ）】: ストレスや疲労で食欲中枢が乱れ過食や甘い物欲求が出やすい体質です。温かい汁物、トリプトファン、マグネシウム、ビタミンB群、自律神経を整える穏やかな食事法のアドバイスを含めてください。",
        hypometabolism: "【低代謝タイプ（体温低め・省エネ体質）】: 平熱が低めで血行が滞りやすく熱産生が低下した体質です。極端な絶食を戒め、生姜や根菜、温かいスープなど体を芯から温めて代謝スイッチを入れる助言を含めてください。",
      };

      const metaInfo = metabolismType && metabolismGuideMap[metabolismType]
        ? `\n\n【対象ユーザー情報】: ${userName ? userName + "さん" : "ユーザー"} の代謝タイプ:\n${metabolismGuideMap[metabolismType]}\n必ずこの代謝タイプに寄り添った専門的な観点を取り入れてアドバイスとスコアを算出してください。`
        : "";

      const prompt = `あなたはプロの管理栄養士およびパーソナル体質改善・ダイエットアドバイザーです。
提供された食事の写真を正確に視覚分析し、カロリーと3大栄養素（PFC：たんぱく質・脂質・炭水化物）、および内訳を推定してください。
ユーザーメモ（もしあれば）: "${mealNote || "特になし"}"${metaInfo}

日本の標準的な食品成分表および一般的な外食・自炊のポーションサイズに基づき、現実的で精度の高い数値を算出してください。
PFCバランスの計算式:
- たんぱく質(P) 1g = 4kcal
- 脂質(F) 1g = 9kcal
- 炭水化物(C) 1g = 4kcal
それぞれの熱量から各栄養素のパーセンテージ（合計100%になるように調整）を求めてください。
また、ユーザーの体質やダイエット目標に対する実践的なアドバイス（改善点、次の食事での調整方法など）を温かく具体的に記載してください。

【LINE返信文案の作成】
会員さんがトレーナーにLINEでこの食事の写真を送信してきた設定です。
トレーナー/管理栄養士から会員さん宛てにそのままコピペしてLINEで送信できる返信文案（lineReplyDraft）を作成してください。
構成の目安:
1. 挨拶・報告へのお礼（例: 「${userName || "〇〇"}さん、お疲れ様です！食事のご報告ありがとうございます😊」）
2. 今回の食事の良かった点（たんぱく質の確保や野菜の彩りなどを褒める）
3. 代謝タイプを踏まえたアドバイスや次回の工夫（例: 「${metabolismType}」の特性に触れた優しいワンポイント）
4. 次の食事や水分補給への一言・前向きな励まし
適度に改行と絵文字（😊💪🥗✨など）を交え、読みやすく温かみのあるトーンにしてください。`;

      const response = await generateWithRetryAndFallback(ai, {
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction:
            "あなたは日本の管理栄養士です。食事画像から料理名、総カロリー、PFCバランス（タンパク質・脂質・炭水化物）、食材内訳、ダイエット観点のアドバイスを日本語のJSON形式で出力します。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: {
                type: Type.STRING,
                description: "料理名または食事全体の要約名（例: 鶏胸肉のグリル定食（玄米・具沢山味噌汁付き））",
              },
              summary: {
                type: Type.STRING,
                description: "識別された品目やポーションの簡単な概要説明",
              },
              calories: {
                type: Type.INTEGER,
                description: "推定総カロリー (kcal)",
              },
              protein: {
                type: Type.NUMBER,
                description: "たんぱく質量 (g)",
              },
              fat: {
                type: Type.NUMBER,
                description: "脂質量 (g)",
              },
              carbs: {
                type: Type.NUMBER,
                description: "炭水化物量 (g)",
              },
              fiber: {
                type: Type.NUMBER,
                description: "食物繊維量 (g)",
              },
              salt: {
                type: Type.NUMBER,
                description: "推定食塩相当量 (g)",
              },
              pfcRatio: {
                type: Type.OBJECT,
                properties: {
                  proteinPercent: {
                    type: Type.NUMBER,
                    description: "P比率 (%: 1g=4kcal換算)",
                  },
                  fatPercent: {
                    type: Type.NUMBER,
                    description: "F比率 (%: 1g=9kcal換算)",
                  },
                  carbPercent: {
                    type: Type.NUMBER,
                    description: "C比率 (%: 1g=4kcal換算)",
                  },
                },
                required: ["proteinPercent", "fatPercent", "carbPercent"],
              },
              foodItems: {
                type: Type.ARRAY,
                description: "写真内で識別された個別料理・食材の内訳",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "品目名" },
                    portion: { type: Type.STRING, description: "推定分量（例: 150g, 1人前, 1杯）" },
                    calories: { type: Type.INTEGER, description: "品目カロリー (kcal)" },
                    protein: { type: Type.NUMBER, description: "たんぱく質 (g)" },
                    fat: { type: Type.NUMBER, description: "脂質 (g)" },
                    carbs: { type: Type.NUMBER, description: "炭水化物 (g)" },
                  },
                  required: ["name", "portion", "calories", "protein", "fat", "carbs"],
                },
              },
              dietScore: {
                type: Type.INTEGER,
                description: "ダイエット適合バランススコア (1〜100)",
              },
              dietAdvice: {
                type: Type.STRING,
                description: "管理栄養士からの具体的で温かいダイエットアドバイス（次回食事の調整提案含む）",
              },
              lineReplyDraft: {
                type: Type.STRING,
                description: "会員様へのLINE返信メッセージ案。コピペですぐ送れるよう挨拶・褒め・体質別アドバイス・励ましを含めたLINE文面",
              },
            },
            required: [
              "dishName",
              "summary",
              "calories",
              "protein",
              "fat",
              "carbs",
              "pfcRatio",
              "foodItems",
              "dietScore",
              "dietAdvice",
              "lineReplyDraft",
            ],
          },
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error("AIから有効な応答が得られませんでした。");
      }

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      return res.status(500).json({
        error: "食事画像のAI解析中にエラーが発生しました: " + (err?.message || "不明なエラー"),
      });
    }
  });

  // Text-based AI Food Estimation (for quick search or text additions)
  app.post("/api/estimate-text-meal", async (req, res) => {
    try {
      const { mealDescription, metabolismType = "", userName = "" } = req.body;
      if (!mealDescription) {
        return res.status(400).json({ error: "食事の内容を入力してください。" });
      }

      const ai = getGenAI();

      const metabolismGuideMap: Record<string, string> = {
        lipid: "【脂質代謝タイプ（脂質で太りやすい体質）】: 脂質比率に配慮し、低脂質調理や良質な脂の選択をアドバイスに含めてください。",
        carb: "【糖質タイプ（糖質で太りやすい体質）】: 血糖値スパイク防止、ベジファースト、低GI食品への置き換えをアドバイスに含めてください。",
        muscle: "【筋肉が付きにくいタイプ（ハードゲイナー）】: たんぱく質（毎食25〜30g目安）の確保と筋肉維持の助言を含めてください。",
        stress: "【ストレスタイプ（自律神経・過食）】: 温かい汁物、トリプトファン、マグネシウム、心身を落ち着かせる食事法をアドバイスに含めてください。",
        hypometabolism: "【低代謝タイプ（体温低め・省エネ体質）】: 生姜や根菜、温かい汁物など体を温めて熱産生を高める助言を含めてください。",
      };

      const metaInfo = metabolismType && metabolismGuideMap[metabolismType]
        ? `\n【対象ユーザー情報】: ${userName ? userName + "さん" : "ユーザー"} の代謝タイプ:\n${metabolismGuideMap[metabolismType]}\nこの体質傾向を踏まえた実践的なアドバイスを提供してください。`
        : "";

      const prompt = `ユーザーが食べた食事内容: "${mealDescription}"${metaInfo}
日本の食品標準成分表に基づき、推定カロリーとPFC（タンパク質・脂質・炭水化物）、内訳、体質に合わせたダイエットアドバイスを算出してください。
また、会員さんがLINEでこの食事メニューを報告してきたと想定し、トレーナーから会員さん（${userName || "〇〇"}さん）へ送るコピペ可能な温かいLINE返信文案（lineReplyDraft）を作成してください。挨拶、報告の感謝、褒め、体質別ワンポイント、励ましを含めてください。`;

      const response = await generateWithRetryAndFallback(ai, {
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "あなたは日本の管理栄養士です。食事のテキスト説明から料理名、総カロリー、PFCバランス（タンパク質・脂質・炭水化物）、食材内訳、ダイエット観点のアドバイスを日本語のJSON形式で出力します。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING },
              summary: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              salt: { type: Type.NUMBER },
              pfcRatio: {
                type: Type.OBJECT,
                properties: {
                  proteinPercent: { type: Type.NUMBER },
                  fatPercent: { type: Type.NUMBER },
                  carbPercent: { type: Type.NUMBER },
                },
                required: ["proteinPercent", "fatPercent", "carbPercent"],
              },
              foodItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    portion: { type: Type.STRING },
                    calories: { type: Type.INTEGER },
                    protein: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                  },
                  required: ["name", "portion", "calories", "protein", "fat", "carbs"],
                },
              },
              dietScore: { type: Type.INTEGER },
              dietAdvice: { type: Type.STRING },
              lineReplyDraft: {
                type: Type.STRING,
                description: "会員様へのLINE返信メッセージ案",
              },
            },
            required: [
              "dishName",
              "summary",
              "calories",
              "protein",
              "fat",
              "carbs",
              "pfcRatio",
              "foodItems",
              "dietScore",
              "dietAdvice",
              "lineReplyDraft",
            ],
          },
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error("AIから有効な応答が得られませんでした。");
      }

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("Text Estimation Error:", err);
      return res.status(500).json({
        error: "食事内容のAI解析中にエラーが発生しました: " + (err?.message || "不明なエラー"),
      });
    }
  });

  // Dedicated endpoint to generate / regenerate custom LINE reply messages
  app.post("/api/generate-line-reply", async (req, res) => {
    try {
      const {
        userName = "会員",
        metabolismType = "lipid",
        dishName = "お食事",
        calories = 0,
        protein = 0,
        fat = 0,
        carbs = 0,
        dietAdvice = "",
        tone = "supportive", // "supportive" | "positive" | "concise" | "logical"
        trainerNote = "",
      } = req.body;

      const ai = getGenAI();

      const metabolismGuideMap: Record<string, string> = {
        lipid: "【脂質代謝タイプ（脂質で太りやすい体質）】: 脂質を控えめ（蒸す・茹でる等）、良質なたんぱく質と野菜を摂る意識を促す。",
        carb: "【糖質タイプ（糖質で太りやすい体質）】: 糖質の摂りすぎ防止、ベジファーストの徹底、低GI炭水化物（玄米・大豆等）の推奨。",
        muscle: "【筋肉が付きにくいタイプ】: 筋分解を防ぐため十分なたんぱく質補給（毎食25g〜）と適正エネルギー摂取を促す。",
        stress: "【ストレスタイプ】: 温かい汁物やマグネシウム・ビタミン補給、自律神経を整え夜の過食衝動を防ぐ助言。",
        hypometabolism: "【低代謝タイプ】: 体を冷やさず温める食材（生姜・根菜・温かいスープ等）としっかり咀嚼して熱産生を高める助言。",
      };

      const toneInstructions: Record<string, string> = {
        supportive: "【トーン: 丁寧＆親身】管理栄養士・パーソナルトレーナーとして、誠実かつ温かい敬語。食事報告への感謝、良い部分の承認、無理のない次回のアドバイスで安心感を与える。",
        positive: "【トーン: ポジティブ＆褒めて伸ばす】明るく元気な雰囲気！絵文字（✨💪🔥😊🎉）を適度に使用し、努力や素晴らしい点を絶賛してモチベーションを最大限引き上げる。",
        concise: "【トーン: 簡潔＆要点クイック】忙しい会員さん向けに、要点（良かった点1つ・次回の改善点1つ）を短く箇条書きや1〜2段落でスッキリまとめる。",
        logical: "【トーン: 論理的＆PFC数値重視】たんぱく質○g、脂質○g、カロリー等の具体的数値を引用し、代謝の観点から理論的に解説し、次回の具体的な摂取指針を提示する。",
      };

      const prompt = `あなたはパーソナルトレーナー・管理栄養士です。
会員様がLINEで以下の食事メニューまたは食事写真を報告してくれました。
この報告に対し、トレーナーから会員様のLINEにそのままコピペして送信する返信メッセージを1通作成してください。

【会員様情報】
- お名前: ${userName}様
- 体質・代謝タイプ: ${metabolismGuideMap[metabolismType] || "標準"}

【今回の食事データ】
- メニュー名: ${dishName}
- 推定カロリー: ${calories} kcal
- PFCバランス: たんぱく質 ${protein}g / 脂質 ${fat}g / 炭水化物 ${carbs}g
${dietAdvice ? `- 栄養分析メモ: ${dietAdvice}` : ""}
${trainerNote ? `- トレーナーからの個別伝達事項: "${trainerNote}"` : ""}

【返信メッセージの指定トーン】
${toneInstructions[tone] || toneInstructions.supportive}

【メッセージ作成の必須要件】
1. 冒頭で「${userName}さん、お疲れ様です！食事のご報告ありがとうございます😊」といった自然なLINEの挨拶
2. 今回の食事の良かった点（たんぱく質の意識や彩りなど）をまず承認する
3. 会員様の代謝タイプに配慮した、次回食事のワンポイント改善アドバイス
4. トレーナーからの個別伝達事項があれば自然に文中に盛り込む
5. 最後に次回の食事やトレーニングへの温かい励ましで締めくくる
6. LINEメッセージとして読みやすいよう、適度な改行と自然な絵文字を使用する
7. 余計な前置きや解説（「以下がLINE返信案です」など）は一切含めず、LINEメッセージの本文のみを出力してください。`;

      const response = await generateWithRetryAndFallback(ai, {
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "あなたはパーソナルジム・栄養指導のプロトレーナーです。会員様へのLINE返信メッセージ本文のみを出力してください。",
        },
      });

      const replyText = response.text?.trim() || "";
      return res.json({ success: true, replyText });
    } catch (err: any) {
      console.error("Line Reply Generation Error:", err);
      return res.status(500).json({
        error: "LINE返信文の生成中にエラーが発生しました: " + (err?.message || "不明なエラー"),
      });
    }
  });

  // Vite middleware for dev or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
