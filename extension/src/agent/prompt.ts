export function audit(input: string): string {
  return `
Check furigana readings. CSV format: index,kanji,reading.
Return JSON array of wrong indices only. Most are correct, so output is usually [] or [1-2 indices]. Be strict.

Input:
${input}

Output: JSON array of integers, e.g. [] or [2] or [5,10]
  `;
}
