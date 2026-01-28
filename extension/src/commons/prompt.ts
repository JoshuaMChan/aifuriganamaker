import type { FuriganaSnapshot } from "@/commons/furiganaMemory.ts";

export function audit(items: FuriganaSnapshot): string {
  return `
    ## Task
    Audit the wrong pairs of 振り仮名. Give the wrong pairs by the exact format as I define in the end of this prompt.

    ## Input format
    interface FuriganaSnapshot {
    /** The full original text content before any <ruby> tags were inserted */
    text: string;
    /** All kanji tokens in this text, including their readings and positions */
    tokens: {
      original: string;    // The original kanji string for this token
      reading: string;     // The current reading (kana) used for this token
      start: number;       // Start index in the full text (inclusive)
      end: number;         // End index in the full text (exclusive)
      isFiltered: boolean; // You can ignore this file
    }[];

    ## Input Data
    ${items}

    ## Out format
    an array of indexs of wrong tokens from the token list.
  `;
}
