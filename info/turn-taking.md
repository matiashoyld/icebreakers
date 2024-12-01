# Turn-Taking System in Icebreakers

The Icebreakers simulation implements a sophisticated turn-taking system that mimics natural conversation dynamics in video calls. This document outlines the key components and mechanisms of this system.

## Additional Features to be Implemented:

- **Improved Mention Logic**: Currently, mentions work but still don't have the natural flow of conversation. We need to improve the mention logic to create more natural conversation flows.
- **Participation Pressure:** We can add a "pressure to participate" factor that increases an agent's engagement score if they haven't spoken yet, especially in contexts like introductions. Let me check the current turn prompt first:

## Core Components

### 1. Engagement Scoring
The system uses an AI-powered engagement scoring mechanism that evaluates each participant's likelihood to speak next based on several factors:

- **Words Spoken**: Total contribution to the conversation
- **Camera Status**: Whether their camera is on/off
- **Participation Rate**: Historical engagement level
- **Recent Activity**: Whether they were the last speaker
- **Context Awareness**: Understanding of the current conversation topic

See lib/llm/prompts/engagement-prompt.ts for details. This template is used to generate engagement scores for each participant. Thus, 4 LM calls are made before each turn.

### 2. Direct Mentions
The system implements an "@mention" feature that allows participants to directly address each other:

- When a participant mentions another using "@name", the mentioned participant gets priority to speak next
- This creates natural conversation flows and direct responses
- The system validates mentions against participant names (case-insensitive)

### 3. Turn Management
The turn-taking logic follows these priorities:

1. Direct mentions take highest precedence (@mentions)
2. If no mentions, engagement scores determine the next speaker
3. The system considers:
   - Time since last speaking
   - Current engagement level
   - Relevance to the current topic
   - Individual personality traits

## Implementation Details

### Engagement Scoring Algorithm
Each participant's engagement score is calculated based on:

```typescript
interface EngagementFactors {
    wordsSpoken: number
    cameraOn: boolean
    participationRate: number
    wasLastSpeaker: boolean
}
```

The system uses OpenAI to analyze these factors along with:
- Recent dialogue context (last 5 messages)
- Participant personalities
- Current conversation dynamics

### Turn Selection Process

1. **Mention Check**:
   - System checks the last message for @mentions
   - If found, the mentioned participant gets the next turn
   - Validates that the mentioned participant isn't the current speaker

2. **Engagement-Based Selection**:
   - If no mentions, calculates engagement scores for all participants
   - Considers recent conversation history
   - Accounts for participation balance
   - Factors in individual personality traits

3. **Action Determination**:
   - Selected participant can:
     - Speak (contribute a message)
     - Toggle camera
     - Choose to do nothing
   - Decision based on personality and context

## Natural Conversation Features

The system encourages natural conversation through:

1. **Personality-Driven Responses**:
   - Each agent maintains consistent personality traits
   - Responses reflect individual characteristics
   - Natural variation in participation levels

2. **Context Awareness**:
   - Tracks conversation topic and objectives
   - Maintains dialogue history
   - Considers group dynamics

3. **Dynamic Engagement**:
   - Camera toggling for non-verbal engagement
   - Varying participation rates
   - Natural turn-taking through @mentions
