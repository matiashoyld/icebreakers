export const ENGAGEMENT_PROMPT = `
[Input]
!<INPUT 0>!: Dialogue history
!<INPUT 1>!: Agent descriptions 

[Output]
Output format -- output your response in JSON format with the following fields:
{
  "<agent_name>": <engagement_score>,
  "<agent_name>": <engagement_score>,
  ...
}

Where <engagement score> is an integer between 0 and 100, representing the agent's level of interest in contributing to the conversation.

###

You are an analyst tasked with determining which agent is most engaged in a conversation. Based on the dialogue history and agent descriptions, assign an engagement score to each agent.

Dialogue history:
<dialogue_history>
!<INPUT 0>!
</dialogue_history>

Agent descriptions:
<agent_descriptions>
!<INPUT 1>!
</agent_descriptions>

Assign an engagement score to each agent based on their interest in contributing to the conversation. Consider factors such as relevance to the conversation topic, level of participation, and tone.

Output your response in the JSON format specified above.
`;

