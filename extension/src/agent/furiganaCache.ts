import type { KanjiMark } from "@/entrypoints/background/listeners/onGetKanjiMarksMessage.ts";

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
