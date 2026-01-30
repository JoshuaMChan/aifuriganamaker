import { GoogleGenAI } from "@google/genai";

export async function gemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  // `@google/genai` SDK 直接返回对象，不是 fetch Response。
  // 根据官方示例，结果文本在 `response.text`（或 `response.response.text()`）里。
  const anyResponse: any = response;
  const text: string =
    // 新版 SDK 通常是 response.response.text()
    (anyResponse.response && typeof anyResponse.response.text === "function"
      ? anyResponse.response.text()
      : anyResponse.text) ?? "";

  return text;
}
