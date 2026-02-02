export function audit(input: string): string {
  return `
    ## Task
    Correct each line of the input for 振り仮名 inside the parameters.
    If there is any incorrect 振り仮名, correct it.
    Only show the words that were wrong and corrected.
    Split each corrected word by lines;

    ## Input Data
    ${input}
  `;
}
