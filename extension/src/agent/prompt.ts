export function audit(input: string): string {
  return `
    ## Task
    Correct each line of the input for 振り仮名 inside the parameters.
    If a line has incorrect 振り仮名, correct it. Only show the kanji that were wrong and corrected. for example 漢字(かんあざ)=>漢字(かんじ)

    ## Input Data
    ${input}
  `;
}
