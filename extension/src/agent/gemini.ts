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
const DEFAULT_MODEL: GeminiModelType = GeminiModel.PRO_3_PREVIEW;

/**
 * Calls Gemini API with JSON schema to return a dictionary of corrections.
 * @param prompt - The prompt to send to Gemini
 * @param model - The Gemini model to use
 * @returns JSON string representing a dictionary (e.g., '{"1": "かな", "5": "がつ"}')
 */
export async function gemini(
  prompt: string,
  model: GeminiModelType = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const ai = new GoogleGenAI({ apiKey });

  const startTime = performance.now();
  console.log(`input: ${prompt}`);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const anyResponse: any = response;

  // Handle nested response structure: response.response.text() or response.text
  const innerResponse = anyResponse.response || anyResponse;
  const text: string =
    (innerResponse && typeof innerResponse.text === "function"
      ? innerResponse.text()
      : innerResponse?.text) ?? "";

  // Access usageMetadata from the correct level
  const usageMetadata = innerResponse?.usageMetadata || anyResponse.usageMetadata || response.usageMetadata;

  console.log(`output: ${text}`);
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log("duration: ", duration.toFixed(2), "ms");
  console.log("# of tokens: ", usageMetadata);

  return text;
}
