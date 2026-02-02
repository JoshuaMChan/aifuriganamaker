import type { FuriganaResult } from "@/commons/addFurigana";

/**
 * Optimizes FuriganaResult array for token-efficient prompt usage.
 *
 * Format: Reconstructs the original text with furigana in parentheses.
 * Example: "振(ふ)り仮名(かな)"
 *
 * @param results - Array of FuriganaResult to optimize
 * @returns Compact string format optimized for token usage
 */
export function promptCompress(results: FuriganaResult[]): string {
  if (results.length === 0) {
    return "";
  }

  // Filter out results with zero length tokens
  const filteredResults = results.filter((result) => result.tokens.length > 0);

  if (filteredResults.length === 0) {
    return "";
  }

  // Format: Combine all originalText into one line, then all tokens with adjusted indices
  // Example:
  // 振り仮名漢字
  // 0,振,ふ
  // 1,仮名,がな
  // 4,漢字,かんじ

  // Combine all originalText into one continuous string
  let combinedText = filteredResults.map((result) => result.originalText).join("\n");
  combinedText += "\n";
  // Collect all tokens with adjusted indices
  const allTokens: Array<{ index: number; original: string; reading: string }> = [];
  let offset = 0;

  for (let i = 0; i < filteredResults.length; i++) {
    const result = filteredResults[i]!;
    for (const token of result.tokens) {
      // Adjust index based on the cumulative offset
      allTokens.push({
        index: offset + token.start,
        original: token.original,
        reading: token.reading,
      });
    }
    // Update offset for next result (add text length + newline if not last)
    offset += result.originalText.length;
    if (i < filteredResults.length - 1) {
      offset += 1; // Add 1 for the newline character
    }
  }

  // Build output: first line is combined text, then CSV lines for tokens
  const lines = [combinedText];
  for (const token of allTokens) {
    lines.push(`${token.index},${token.original},${token.reading}`);
  }

  return lines.join("\n");
}
