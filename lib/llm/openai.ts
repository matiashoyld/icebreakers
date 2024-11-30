/**
 * Generates a prompt by replacing placeholders in a template
 */
export async function generatePrompt(
  promptInput: string | string[],
  promptTemplate: string
): Promise<string> {
  const inputs = Array.isArray(promptInput) ? promptInput : [promptInput]
  let prompt = promptTemplate

  // First replace the input placeholders
  inputs.forEach((input, index) => {
    const placeholder = `!<INPUT ${index}>!`
    prompt = prompt.replaceAll(placeholder, String(input))
  })

  // Then split by the comment block marker and take the part after it
  if (prompt.includes('<commentblockmarker>###</commentblockmarker>')) {
    prompt = prompt.split('<commentblockmarker>###</commentblockmarker>')[1]
  }

  return prompt.trim()
}
