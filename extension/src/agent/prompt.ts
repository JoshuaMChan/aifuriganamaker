export function audit(input: string): string {
  return `
    ## Task
    The csv below the text are the furigana of the original kanjis. Those numbers are indices in the string.
    If any furigana is wrong, correct it. Compute the exact array of indices of corrected kanji alone.
    It is likely that most of them are correct, so you are likely to have 0, 1, or 2 outputs. Make it very strict.

    ## Input Data
    ${input}
  `;
}
