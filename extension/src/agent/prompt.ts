export function audit(input: string): string {
  return `
    ## Task
    Audit the wrong pairs of 振り仮名. Give the corrected pairs with the exact syntax as input.

    ## Input example
    振り,ふり;仮名,がな;

    ## Output example
    仮名,かな;

    ## Input Data
    ${input}
  `;
}
