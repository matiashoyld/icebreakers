import { Participant, SimulationStep } from '@/app/types/types'
import { getEngagementScores } from './engagement-scores'

export type SimulationContext = {
  participants: Participant[]
  currentTurn: number
  dialogueHistory: string[]
  conversationContext: string
}

export async function getNextSimulationStep(
  context: SimulationContext,
  currentParticipantId: number
): Promise<SimulationStep> {
  try {
    console.log('=== Starting new simulation step ===');
    console.log('Current participant ID:', currentParticipantId);
    console.log('Current turn:', context.currentTurn);
    console.log('Current dialogue history:', context.dialogueHistory);

    // Get engagement scores for all participants
    console.log('Getting engagement scores...');
    const engagementScores = await getEngagementScores(context.participants, context);
    console.log('Raw engagement scores:', engagementScores);
    
    // Debug the participant selection process
    const selectionProcess = Object.entries(engagementScores).map(([id, score]) => ({
      id: Number(id),
      score,
      name: context.participants.find(p => p.id === Number(id))?.name,
      isCurrent: Number(id) === currentParticipantId
    }));
    console.log('Participant selection candidates:', selectionProcess);
    
    // Find the participant with highest engagement score
    const nextParticipantId = Object.entries(engagementScores)
      .filter(([id]) => Number(id) !== currentParticipantId) // Exclude current participant
      .reduce((max, [id, score]) => {
        if (!max) return id; // If this is the first valid participant, select them
        const currentMax = engagementScores[max];
        console.log(`Comparing participant ${id} (score: ${score}) with current max ${max} (score: ${currentMax})`);
        return score > currentMax ? id : max;
      }, ''); // Start with empty string instead of currentParticipantId

    // If no one else wants to speak, pick someone randomly
    const finalNextParticipantId = nextParticipantId ? 
      Number(nextParticipantId) : 
      context.participants
        .filter(p => p.id !== currentParticipantId)
        .map(p => p.id)
        [Math.floor(Math.random() * (context.participants.length - 1))];
    
    console.log('Selected next participant:', {
      id: finalNextParticipantId,
      name: context.participants.find(p => p.id === finalNextParticipantId)?.name,
      score: engagementScores[finalNextParticipantId]
    });

    console.log('Making API call to /api/simulation...');
    const response = await fetch('/api/simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        currentParticipantId: finalNextParticipantId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Simulation API error:', errorData);
      throw new Error(errorData.error || 'Failed to get next simulation step');
    }

    const data = await response.json();
    console.log('API response:', data);
    
    // Log the final decision
    console.log('=== Simulation step complete ===');
    console.log('Final selection:', {
      participantId: data.participantId,
      name: context.participants.find(p => p.id === data.participantId)?.name,
      action: data.action,
      hasMessage: !!data.message
    });
    
    return data;
  } catch (error) {
    console.error('Error in getNextSimulationStep:', error);
    throw error;
  }
}
