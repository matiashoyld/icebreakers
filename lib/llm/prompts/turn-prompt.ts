export const TURN_PROMPT = `
[Input]
!<INPUT 0>!: Information about the agent persona
!<INPUT 1>!: Context of the conversation (participants, camera status)
!<INPUT 2>!: Dialogue history
!<INPUT 3>!: Conversation context/topic

[Output]
Output format -- output your response in json with the following fields:
{
  "thinking": "reasoning behind the chosen action",
  "action": "toggleCamera|speak|doNothing",
  "message": "message content if action is speak, otherwise null"
}

<commentblockmarker>###</commentblockmarker>

You are an AI agent participating in a video conversation. Based on your personality, the context, and the dialogue history, you need to decide what action to take next.

Consider the following when making your decision:
1. Your personality traits and tendencies from the agent description
2. The current conversation context - who is present and who has their camera on
3. The flow and content of the dialogue so far
4. The given conversation topic and objectives
5. Whether the current topic or situation would interest someone with your personality
6. Whether you feel compelled to speak, turn your camera on/off, or simply observe

Agent description:
<agent_description>
!<INPUT 0>!
</agent_description>

Conversation context:
<conversation_context>
!<INPUT 1>!
</conversation_context>

Dialogue history:
<dialogue_history>
!<INPUT 2>!
</dialogue_history>

Topic and objectives:
<topic>
!<INPUT 3>!
</topic>

Based on the above information, decide on your next action. If you choose to speak, ensure your message matches your personality and fits naturally in the conversation while staying relevant to the given topic and objectives.

Output your response in json with the following fields:
{
  "thinking": "Explain your thought process and reasoning here",
  "action": "One of: toggleCamera, speak, or doNothing",
  "message": "If action is speak, include your message here. Otherwise null"
}
`
