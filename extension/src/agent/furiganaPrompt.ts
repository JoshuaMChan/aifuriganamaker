import type { FuriganaResult } from "@/commons/addFurigana";

/**
 * Optimizes FuriganaResult array for token-efficient prompt usage.
 *
 * Format: "original,reading;original,reading;" for each result.
 * Multiple results are separated by newlines.
 *
 * Example: "黒,くろ;白,しろ;\n猫,ねこ;"
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

  // Format: "original,reading;original,reading;" for each result
  const formattedResults = filteredResults.map((result) => {
    const tokenPairs = result.tokens.map((token) => `${token.original},${token.reading}`);
    return tokenPairs.join(";") + ";";
  });

  // Join multiple results with newlines
  return formattedResults.join("\n");
}
