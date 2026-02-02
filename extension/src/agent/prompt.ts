export function audit(input: string): string {
  return `
Check furigana readings. CSV format: index,kanji,reading.
Return JSON dictionary of corrected kana.

Input:
${input}

Output:
1. JSON dictionary of {integers:string},
e.g. {} or {1:'かな'}
  `;
}
