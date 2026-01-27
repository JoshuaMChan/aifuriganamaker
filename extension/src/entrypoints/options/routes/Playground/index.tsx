import { useState } from "react";
import { gemini } from "@/gemini.ts";
import { type FuriganaSegment, JapaneseTextarea } from "./components/JapaneseTextarea";
import { TextWithFurigana } from "./components/TextWithFurigana";

// TODO: 替换为你自己的 Gemini API Key，仅用于本地测试。
const GEMINI_API_KEY = "AIzaSyBNeGkAdQ4RVA02u0jIb3MvWE3Ll5dja58";

export const Playground = () => {
  const [furiganaSegments, setFuriganaSegments] = useState<FuriganaSegment[]>([]);
  const [geminiText, setGeminiText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Always use hiragana for the playground preview.

  const handleTestGemini = async () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith("<PUT_")) {
      setError("Gemini API キーを設定してください。");
      return;
    }

    setLoading(true);
    setError(null);
    setGeminiText("");

    try {
      const text: string = await gemini("hello");

      setGeminiText(text || "（テキストが返ってきませんでした）");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mt-3 grid w-full grid-rows-2 gap-2.5 text-xl md:grid-cols-2">
        <JapaneseTextarea onSegmentsChange={setFuriganaSegments} furiganaType="hiragana" />
        <div className="flex w-full flex-col gap-3">
          <TextWithFurigana furiganaSegments={furiganaSegments} />

          {/* 这里是图片／预览区域下方的新 span，用来显示 Gemini 返回的纯文本 */}
          <button
            type="button"
            onClick={handleTestGemini}
            disabled={loading}
            className="self-start rounded bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "読み込み中…" : "Gemini をテスト"}
          </button>
          <span className="whitespace-pre-wrap text-slate-200 text-sm dark:text-slate-200">
            {error ? `Error: ${error}` : geminiText || "ここに Gemini の返答が表示されます。"}
          </span>
        </div>
      </div>
    </div>
  );
};
