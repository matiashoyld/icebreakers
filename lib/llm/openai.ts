import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Returns the OpenAI client instance, creating it if it doesn't exist
 */
export function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        // Access the environment variable through window.ENV or Next.js runtime config
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not found in environment variables');
        }
        openaiClient = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
    }
    return openaiClient;
}

/**
 * Generates a prompt by replacing placeholders in a template
 */
export async function generatePrompt(
    promptInput: string | string[],
    promptTemplate: string
): Promise<string> {
    const inputs = Array.isArray(promptInput) ? promptInput : [promptInput];
    let prompt = promptTemplate;

    inputs.forEach((input, index) => {
        prompt = prompt.replace(`!<INPUT ${index}>!`, String(input));
    });

    console.log('Generated prompt:', prompt);

    if (prompt.includes('<commentblockmarker>###</commentblockmarker>')) {
        prompt = prompt.split('<commentblockmarker>###</commentblockmarker>')[1];
    }

    return prompt.trim();
}
