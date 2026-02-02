import { GoogleGenAI } from "@google/genai";

/**
 * Supported Gemini models and agents
 */
export const GeminiModel = {
  /** Gemini 2.5 Pro */
  PRO_2_5: "gemini-2.5-pro",
  /** Gemini 2.5 Flash */
  FLASH_2_5: "gemini-2.5-flash",
  /** Gemini 2.5 Flash-lite */
  FLASH_LITE_2_5: "gemini-2.5-flash-lite",
  /** Gemini 3 Pro Preview */
  PRO_3_PREVIEW: "gemini-3-pro-preview",
  /** Gemini 3 Flash Preview */
  FLASH_3_PREVIEW: "gemini-3-flash-preview",
  /** Deep Research Preview */
  DEEP_RESEARCH_PREVIEW: "deep-research-pro-preview-12-2025",
} as const;

export type GeminiModelType = (typeof GeminiModel)[keyof typeof GeminiModel];

/**
 * Default model to use
 * Change this to switch models easily
 */
const DEFAULT_MODEL: GeminiModelType = GeminiModel.FLASH_3_PREVIEW;

export async function gemini(
  prompt: string,
  model: GeminiModelType = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const ai = new GoogleGenAI({ apiKey });

  const startTime = performance.now();
  console.log(`input: ${prompt}`);

  return '';

  // const response = await ai.models.generateContent({
  //   model,
  //   contents: prompt,
  // });
  //
  // const anyResponse: any = response;
  // const text: string =
  //   (anyResponse.response && typeof anyResponse.response.text === "function"
  //     ? anyResponse.response.text()
  //     : anyResponse.text) ?? "";
  //
  // console.log(`output: ${text}`);
  // const endTime = performance.now();
  // const duration = endTime - startTime;
  // console.log("duration: ", duration.toFixed(2), "ms");
  // console.log("# of tokens: ", response.usageMetadata);
  //
  // return text;
}
