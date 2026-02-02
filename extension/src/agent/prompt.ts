export function audit(input: string): string {
  return `
    ## Task
    Correct the each line of the input of 振り仮名 inside of the parameters.
    If the line is wrong with 振り仮名, correct it. Only shows the lines that was wrong and corrected.

    ## Input Data
    ${input}
  `;
}
