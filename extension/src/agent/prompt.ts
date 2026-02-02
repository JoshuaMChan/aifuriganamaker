export function audit(input: string): string {
  return `
    ## Task
    The csv below the text are the furigana of the original kanjis. Those numbers are indices in the string.
    If any furigana is wrong, correct it. Compute the exact array of indices of corrections.

    ## Input Data
    ${input}

    ## Input Example
    振り仮名
    0,ふ
    2,かな

    ## Output Example
    [2]
  `;
}
