/**
 * Generates a prompt by replacing placeholders in a template
 */
export async function generatePrompt(
  promptInput: string | string[],
  promptTemplate: string
): Promise<string> {
  const inputs = Array.isArray(promptInput) ? promptInput : [promptInput]
  let prompt = promptTemplate

  inputs.forEach((input, index) => {
    prompt = prompt.replace(`!<INPUT ${index}>!`, String(input))
  })

  if (prompt.includes('<commentblockmarker>###</commentblockmarker>')) {
    prompt = prompt.split('<commentblockmarker>###</commentblockmarker>')[1]
  }

  return prompt.trim()
}
