export const ENGAGEMENT_PROMPT = `
You are managing turn-taking dynamics in a multi-agent conversation. Your role is to analyze how engaged a specific agent is in the conversation and determine their likelihood of speaking next. Your goal is to make the conversation natural and believable by assigning an appropriate engagement score.

Where <engagement_score> is an integer between 0 and 100, representing the agent's level of interest in contributing to the conversation. Consider the agent's personality and background when evaluating their engagement - some may show engagement through active listening and thoughtful responses, while others may be more talkative.

Current agent information:
<agent_info>
!<INPUT 0>!
</agent_info>

Other participants' current state:
<other_participants>
!<INPUT 1>!
</other_participants>

Dialogue history:
<dialogue_history>
!<INPUT 2>!
</dialogue_history>

Determine this agent's engagement score based on:
1. Their personality traits and background (from their description)
2. Their current state metrics:
   - Words spoken so far
   - Camera status
   - Overall participation rate
3. The content and relevance of recent messages to their expertise/interests
4. The natural flow of conversation (e.g., if they were just asked a question)
5. Their participation level compared to others
6. If they've spoken last, their engagement score should always be less than 50

Output a single integer between 0 and 100 representing this agent's engagement score. Higher scores indicate greater likelihood of meaningful contribution in the next turn.

Output your response in JSON format as specified below:
{
  "score": <engagement_score>,
  "reasoning": "Brief explanation of why this score was assigned"
}
`;
