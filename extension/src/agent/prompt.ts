export function audit(input: string): string {
  return `
    ## Task
    Audit the wrong pairs of 振り仮名. Give the wrong pairs by an exact int array of indices of wrong pairs from the token list. Nothing more.

    ## Input format example
    振り,ふり;仮名,かな;

    ## Input Data
    ${input}
  `;
}
