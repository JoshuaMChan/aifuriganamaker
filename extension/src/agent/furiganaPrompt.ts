import type { FuriganaResult } from "@/commons/addFurigana";

/**
 * Compresses a single FuriganaResult for prompt usage.
 * Format: originalText on first line, then CSV lines for tokens.
 *
 * @param result - Single FuriganaResult to compress
 * @returns Compact string format for one line
 */
export function promptCompressSingle(result: FuriganaResult): string {
  if (result.tokens.length === 0) {
    return "";
  }

  // First line: the original text
  const lines = [result.originalText];

  // Following lines: CSV format for each token (index,original,reading)
  for (const token of result.tokens) {
    lines.push(`${token.start},${token.original},${token.reading}`);
  }

  return lines.join("\n");
}

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

  // Format: Reconstruct text with furigana in parentheses like "振(ふ)り仮名(かな)"
  const formattedResults = filteredResults.map((result) => {
    const { originalText, tokens } = result;

    // Sort tokens by start position (descending) to insert from end to start
    const sortedTokens = [...tokens].sort((a, b) => b.start - a.start);

    // Build the result string by inserting furigana from right to left
    let resultText = originalText;
    for (const token of sortedTokens) {
      const before = resultText.substring(0, token.start);
      const tokenText = resultText.substring(token.start, token.end);
      const after = resultText.substring(token.end);

      // Replace token with "original(reading)" format
      resultText = before + `${tokenText}(${token.reading})` + after;
    }

    return resultText;
  });

  // Join multiple results with newlines
  return formattedResults.join("\n");
}
