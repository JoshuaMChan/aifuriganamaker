import { gemini } from "@/agent/gemini";
import { onMessage } from "@/commons/message";

export const registerOnCallGeminiMessage = () => {
  onMessage("callGemini", async ({ data }) => {
    try {
      const result = await gemini(data.prompt);
      return { 
        response: result.text,
        usageMetadata: result.usageMetadata,
      };
    } catch (error) {
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
};
