import { NextResponse } from 'next/server';
import { getOpenAIClient, generatePrompt } from '@/lib/llm/openai';
import { TURN_PROMPT } from '@/lib/llm/prompts/turn-prompt';
import { SimulationContext } from '@/lib/simulation/simulation-manager';
import { SimulationStep } from '@/app/types/types';

export async function POST(request: Request) {
    try {
        const { context, currentParticipantId } = await request.json();
        const openai = getOpenAIClient();

        // Prepare the context for the prompt
        const currentParticipant = context.participants.find(
            (p: any) => p.id === currentParticipantId
        );
        
        if (!currentParticipant) {
            throw new Error('Current participant not found');
        }

        // Create context string about participants and their camera status
        const participantsContext = context.participants
            .map((p) => `${p.name} (${p.cameraOn ? 'Camera ON' : 'Camera OFF'}): ${p.description}`)
            .join('\n')

        // Create dialogue history string
        const dialogueString = context.dialogueHistory.map((msg) => msg).join('\n')


        // Generate the prompt with enhanced agent information
        const prompt = await generatePrompt([
            JSON.stringify({
                name: currentParticipant.name,
                currentRole: 'You are ' + currentParticipant.name + '. ' + currentParticipant.description,
                cameraOn: currentParticipant.cameraOn,
                wordsSpoken: currentParticipant.wordsSpoken,
                participationRate: currentParticipant.participationRate
            }),
            participantsContext,
            dialogueString,
            context.conversationContext,
        ], TURN_PROMPT);

        // Generate the agent's next action
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Updated to use a valid model name
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7,
        });

        // Parse the response
        const responseContent = completion.choices[0].message.content;
        const parsedResponse = JSON.parse(responseContent || '{}');

        // Construct the simulation step
        const step: SimulationStep = {
            participantId: currentParticipantId,
            action: parsedResponse.action || 'doNothing',
            thinking: parsedResponse.thinking || '',
            message: parsedResponse.message
        };

        return NextResponse.json(step);
    } catch (error) {
        console.error('Simulation API error:', error);
        return NextResponse.json(
            { error: 'Failed to process simulation step' },
            { status: 500 }
        );
    }
}
