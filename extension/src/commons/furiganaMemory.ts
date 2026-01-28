import type { KanjiMark } from "@/entrypoints/background/listeners/onGetKanjiMarksMessage";

/**
 * In-memory store for all furigana that have been generated on the current page.
 *
 * This is per content-script instance (per tab), and is NOT persisted.
 * Later we can use this data to build prompts for Gemini to audit / correct readings.
 */
export interface FuriganaSnapshot {
  /** The full original text node content before ruby was inserted */
  text: string;
  /** All Kanji tokens (with reading, positions, etc.) returned from the tokenizer */
  tokens: KanjiMark[];
}

let snapshots: FuriganaSnapshot[] = [];

/** Save one snapshot (one text node and its tokens) into memory. */
export function addFuriganaSnapshot(text: string, tokens: KanjiMark[]): void {
  if (!text || tokens.length === 0) {
    return;
  }
  snapshots.push({ text, tokens });
}

/** Clear all stored snapshots for the current page. */
export function clearFuriganaSnapshots(): void {
  snapshots = [];
}

/** Get a shallow copy of all snapshots (for debugging or further processing). */
export function getFuriganaSnapshots(): FuriganaSnapshot[] {
  return [...snapshots];
}

/**
 * Build a basic prompt string that can be sent to Gemini to audit readings.
 *
 * You can freely modify this function later to change the prompt style.
 */
export function buildGeminiPromptForCorrection(): string {
  if (snapshots.length === 0) {
    return "";
  }

  const lines: string[] = [];
  lines.push(
    "You are a Japanese reading (furigana) auditor. The following are sentences and their current readings.",
  );
  lines.push(
    "For each token, check if the reading is natural in context. If something is wrong or ambiguous, explain briefly in Japanese.",
  );
  lines.push("");

  snapshots.forEach((snapshot, index) => {
    lines.push(`Sentence ${index + 1}:`);
    lines.push(`原文: ${snapshot.text}`);
    lines.push("読み:");
    snapshot.tokens.forEach((token) => {
      lines.push(`- ${token.original} => ${token.reading}`);
    });
    lines.push("");
  });

  return lines.join("\n");
}
