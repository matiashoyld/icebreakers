/**
 * Counts the number of words in a given text
 */
export function countWords(text: string): number {
  // Remove extra whitespace and split by spaces
  return text.trim().split(/\s+/).length
}

/**
 * Estimates the number of tokens in a text
 * This is a rough estimate based on GPT tokenization patterns:
 * - Average English word is ~1.3 tokens
 * - Punctuation and special characters are counted as tokens
 */
export function estimateTokens(text: string): number {
  const words = countWords(text)
  const punctuationAndSpecialChars = (text.match(/[.,!?;:"'\/\-\(\)\[\]\{\}]/g) || []).length
  
  // Estimate: words * 1.3 for average word-to-token ratio + punctuation
  return Math.ceil(words * 1.3) + punctuationAndSpecialChars
}
