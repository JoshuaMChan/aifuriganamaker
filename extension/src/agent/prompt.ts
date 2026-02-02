export function audit(input: string): string {
  return `
Check furigana readings. CSV format: index,kanji,reading.
Return CSV of wrong indices with each line is a pair of index and correction.

Input:
${input}

Output:
0,ふ
3,がな
  `;
}
