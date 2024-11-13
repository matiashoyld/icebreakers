/**
 * Extracts and parses the first JSON dictionary found in a string
 */
export function extractFirstJsonDict(
  inputStr: string
): Record<string, any> | null {
  try {
    // Replace curly quotes with standard double quotes
    inputStr = inputStr.replace(/[""]/g, '"').replace(/['']/g, "'")

    // Find the first occurrence of '{'
    const startIndex = inputStr.indexOf('{')
    if (startIndex === -1) return null

    // Initialize count to track braces
    let count = 1
    let endIndex = startIndex + 1

    // Find matching closing brace
    while (count > 0 && endIndex < inputStr.length) {
      if (inputStr[endIndex] === '{') count++
      else if (inputStr[endIndex] === '}') count--
      endIndex++
    }

    // Extract and parse JSON string
    const jsonStr = inputStr.slice(startIndex, endIndex)
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return null
  }
}

type ParsedCategoricalResult = {
  responses: string[]
  reasonings: string[]
}

/**
 * Extracts categorical responses and reasonings from a JSON string
 */
export function extractFirstJsonDictCategorical(
  inputStr: string
): ParsedCategoricalResult {
  const reasoningPattern = /"Reasoning":\s*"([^"]+)"/g
  const responsePattern = /"Response":\s*"([^"]+)"/g

  const reasonings: string[] = []
  let match
  while ((match = reasoningPattern.exec(inputStr)) !== null) {
    reasonings.push(match[1])
  }
  const responses: string[] = []
  while ((match = responsePattern.exec(inputStr)) !== null) {
    responses.push(match[1])
  }

  return { responses, reasonings }
}

type ParsedNumericalResult = {
  responses: number[]
  reasonings: string[]
}

/**
 * Extracts numerical responses and reasonings from a JSON string
 */
export function extractFirstJsonDictNumerical(
  inputStr: string
): ParsedNumericalResult {
  const reasoningPattern = /"Reasoning":\s*"([^"]+)"/g
  const responsePattern = /"Response":\s*(\d+\.?\d*)/g

  const reasonings: string[] = []
  let match
  while ((match = reasoningPattern.exec(inputStr)) !== null) {
    reasonings.push(match[1])
  }
  const responses: number[] = []
  while ((match = responsePattern.exec(inputStr)) !== null) {
    responses.push(parseFloat(match[1]))
  }

  return { responses, reasonings }
}
