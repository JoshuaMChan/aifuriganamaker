import { gemini } from "@/agent/gemini";
import { onMessage } from "@/commons/message";

export const registerOnCallGeminiMessage = () => {
  onMessage("callGemini", async ({ data }) => {
    try {
      console.log(data.prompt);
      // const response = await gemini(data.prompt);
      return '';
      // return { response };
    } catch (error) {
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
};
