export function audit(input: string): string {
  return `
    ## Task
    The cvs below the text are the furigana of the original kanjis. Those numbers are indices in the string.
    If any furigana is wrong, correct it. Compute the exact array of indices of corrections.

    ## Input Data
    ${input}
  `;
}
