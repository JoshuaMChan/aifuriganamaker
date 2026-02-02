export function audit(input: string): string {
  return `
    ## Task
    If a line has incorrect 振り仮名(marked by parameters), correct it. Only show the lines that were wrong and corrected.
    Do not show the lines were correct before corrections.

    ## Input Data
    ${input}
  `;
}
