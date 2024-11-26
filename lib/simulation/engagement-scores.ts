// imports: prompt, SimulationContext, Participant, getOpenAIClient
import { ENGAGEMENT_PROMPT } from '@/lib/llm/prompts/engagement-prompt'
import { SimulationContext } from './simulation-manager'
import { Participant } from '@/app/types/types'
import { getOpenAIClient } from '@/lib/llm/openai'
import { generatePrompt } from '@/lib/llm/openai'

interface EngagementResponse {
    score: number;
    reasoning: string;
}

// Get engagement score for a single agent
async function getAgentEngagementScore(
    agent: Participant,
    otherParticipants: Participant[],
    dialogueHistory: string[],
    openai: any
): Promise<EngagementResponse> {
    // Format agent information
    const agentInfo = JSON.stringify({
        name: agent.name,
        description: agent.description,
        currentState: {
            wordsSpoken: agent.wordsSpoken,
            cameraOn: agent.cameraOn,
            participationRate: Math.round(agent.participationRate * 100)
        }
    });

    // Format other participants' information
    const otherParticipantsInfo = otherParticipants.map(p => 
        JSON.stringify({
            name: p.name,
            currentState: {
                wordsSpoken: p.wordsSpoken,
                cameraOn: p.cameraOn,
                participationRate: Math.round(p.participationRate * 100)
            }
        })
    ).join('\n');

    // Generate the prompt for this agent
    const prompt = await generatePrompt(
        [agentInfo, otherParticipantsInfo, dialogueHistory.join('\n')],
        ENGAGEMENT_PROMPT
    );

    // Get engagement score from LLM
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7
    });

    try {
        const content = response.choices[0].message.content;
        const result = JSON.parse(content);
        return {
            score: result.score,
            reasoning: result.reasoning
        };
    } catch (error) {
        console.error('Error parsing LLM response for agent', agent.name, ':', error);
        return { score: 50, reasoning: 'Error calculating engagement score' };
    }
}

// Main function to get engagement scores for all participants
export const getEngagementScores = async (
    participants: Participant[],
    context: SimulationContext 
): Promise<Record<number, number>> => {
    console.log('Getting engagement scores for participants:', participants);
    const openai = getOpenAIClient();
    
    const engagementScores: Record<number, number> = {};
    const engagementReasons: Record<number, string> = {};

    // Get engagement score for each participant
    for (const participant of participants) {
        const otherParticipants = participants.filter(p => p.id !== participant.id);
        
        console.log(`Calculating engagement for ${participant.name}...`);
        const result = await getAgentEngagementScore(
            participant,
            otherParticipants,
            context.dialogueHistory,
            openai
        );

        engagementScores[participant.id] = result.score;
        engagementReasons[participant.id] = result.reasoning;
        
        console.log(`${participant.name}'s engagement score:`, result.score);
        console.log(`Reasoning:`, result.reasoning);
    }

    return engagementScores;
};