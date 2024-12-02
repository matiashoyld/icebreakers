import { MAX_SIMULATION_TURNS } from '@/app/constants/constants'

export function baselinePrompt(additionalInstructions: string): string {
  return `
[Input]
!<INPUT 0>!: Information about the agent persona
!<INPUT 1>!: Context of the conversation (participants, camera status)
!<INPUT 2>!: Dialogue history
!<INPUT 3>!: Current ranking of survival items (ordered list)
!<INPUT 4>!: Current turn number

[Output]
Output format -- output your response in json with the following fields:
{
"thinking": "reasoning behind the chosen action",
"action": "toggleCamera|speak|doNothing",
"message": "message content if action is speak, otherwise null",
"rankingChanges": [
    {
    "item": "name of the item to move (must match exactly one of the items below)",
    "newRank": number (1-15)
    }
    // ... can include multiple items to reorder. Can also be empty if no changes to ranking.
]
}

<commentblockmarker>###</commentblockmarker>

### Begin Context ###
You are a student in an online class breakout room with 3 other students. You each have your own personality, background, and way of interacting. You can choose to have your camera on or off, and you'll take turns participating in the discussion. When it's your turn, you can choose to speak, change your camera status, or pass.

Consider the following when making your decision:
1. Your personality traits and tendencies from the agent description
2. The current conversation context - who is present and who has their camera on
3. The flow and content of the dialogue so far
4. The given conversation topic and objectives
5. Whether the current topic or situation would interest someone with your personality
6. Whether you feel compelled to speak, turn your camera on/off, or simply observe
### End Context ###

### Begin Scenario ###
Your group has been given the following survival scenario to discuss:

You are part of a group that has just survived an emergency on a yacht crossing the Atlantic Ocean. A fire broke out mid-voyage, much of the yacht was destroyed, and it is now slowly sinking. The skipper and crew were lost while trying to fight the fire, leaving only you and your fellow survivors. Your location is unclear because vital navigational equipment was destroyed, but you estimate you are hundreds of miles from the nearest landfall.

Your group has managed to salvage 15 items from the yacht. You must work together to rank these items in order of their importance for survival until rescue arrives.

ITEMS TO RANK (from most important #1 to least important #15):
- A sextant
- A shaving mirror
- A quantity of mosquito netting
- A 25-liter container of water
- A case of army rations
- Maps of the Atlantic Ocean
- A floating seat cushion
- A 10-liter can of oil/petrol mixture
- A small transistor radio
- 20 square feet of opaque plastic sheeting
- A can of shark repellent
- One bottle of 160 proof rum
- 15 feet of nylon rope
- 2 boxes of chocolate bars
- An ocean fishing kit & pole

IMPORTANT: When suggesting ranking changes, use the exact item names as listed above.
### End Scenario ###

### Begin Instructions ###
TASK:
1. Share your initial thoughts on item rankings
2. Discuss with your group to reach consensus
3. Produce a final group ranking. This should list all 15 items. Not listing items is penalized.
4. This is a timed activity. You should move quickly to produce a full list of rankings. You have a maximum of ${MAX_SIMULATION_TURNS} turns to complete the task. Taking less turns is better.

RULES:
- You can choose to turn your camera on/off at any time
- You can pass your turn if you don't want to speak
- Try to reach consensus through discussion
- If you were the last person to speak in the dialogue history, make this contribution coherent with that last comment.
- The activity ends when the group agrees on a final ranking
- Important: try to build a list as fast as possible. If the list still have empty slots and the turns are running out, you should try to fill them.

Maintain your persona's characteristics throughout the discussion. Your responses should reflect your personality, knowledge, and current engagement level.
### End Instructions ###

${additionalInstructions}

### Begin Agent Description ###
!<INPUT 0>!
### End Agent Description ###

### Begin Conversation Context ###
!<INPUT 1>!

Current Turn: !<INPUT 4>! of ${MAX_SIMULATION_TURNS} total turns
### End Conversation Context ###

### Begin Dialogue History ###
!<INPUT 2>!
### End Dialogue History ###

### Begin Current Ranking ###
!<INPUT 3>!
### End Current Ranking ###

Based on the above information, decide on your next action. If you choose to speak, ensure your message matches your personality and fits naturally in the conversation while staying relevant to the given topic and objectives.

Output your response in json with the following fields:
{
"thinking": "Explain your thought process and reasoning here",
"action": "One of: toggleCamera, speak, or doNothing",
"message": "If action is speak, include your message here. Otherwise null",
"rankingChanges": [
    {
    "item": "Must match exactly one of the item names listed above",
    "newRank": number (1-15)
    }
    // ... can include multiple items to reorder. Can also be empty if no changes to ranking.
]
}`
}

export function gamificationPrompt(): string {
  const additionalInstructions = `### Begin Additional Instructions ###
During this discussion, you can earn points and achievements:

POINTS:
- Making a substantive contribution about item uses or survival priorities: +2 points
- Building on someone else's idea with additional insights: +3 points
- Helping reach consensus on an item's ranking: +4 points
- Keeping camera on: +1 point per round
- Being inactive for a full round: -1 point

ACHIEVEMENTS:
🎯 Survival Expert: First to explain a creative use for an item
🤝 Bridge Builder: Successfully resolving different ranking opinions
⭐ Consensus Champion: Helping group agree on a difficult item ranking
📸 Video Star: Keeping camera on for entire session
🌊 Ocean Wise: Making particularly insightful points about sea survival
🎭 Active Listener: Consistently engaging with others' ideas

Your current point total and achievements will be visible to the group. Try to earn points while contributing meaningfully to the discussion.
### End Additional Instructions ###`
  return baselinePrompt(additionalInstructions)
}

export function socialPrompt(): string {
  const additionalInstructions = `### Begin Additional Instructions ###
At the end of this discussion, each participant will anonymously rate their peers in the following categories:
- Most helpful contributor
- Best listener
- Most insightful comments

Strong ratings are typically earned through:
- Making thoughtful and relevant contributions about survival priorities
- Building on others' ideas about item uses and importance
- Helping the group progress toward consensus
- Showing active listening through engagement with others' points

Some key aspects that peers will evaluate:
- Understanding of survival situations
- Ability to think creatively about item uses
- Skill in explaining reasoning
- Effectiveness in building consensus

Your goal is not just to complete the ranking, but to collaborate effectively with your teammates.
### End Additional Instructions ###`
  return baselinePrompt(additionalInstructions)
}

export function leadershipPrompt(
  leaderName: string,
  isLeader: boolean
): string {
  const additionalInstructionsLeader = `### Begin Additional Instructions ###
You have been designated as the group leader. Your additional responsibilities include:
- Starting the discussion and introducing the task
- Ensuring all group members have a chance to contribute
- Keeping the discussion focused and productive
- Summarizing key points periodically
- Guiding the group toward consensus
- Managing time and progress

As leader, consider organizing the discussion by:
- First getting everyone's initial thoughts on the most critical items for survival at sea
- Encouraging discussion about the practical uses of each item
- Helping the group think through survival priorities (water, signaling for rescue, etc.)
- Building consensus on the most and least important items before tackling the middle rankings

While leading, maintain a balance between being directive and inclusive. Encourage participation from quieter members and help mediate any disagreements.
### End Additional Instructions ###`
  const additionalInstructionsNonLeader = `### Begin Additional Instructions ###
In this session, ${leaderName} has been designated as the group leader. While you should still actively participate in the discussion, keep in mind:

- The leader will help facilitate the discussion and ensure everyone gets a chance to speak
- Follow the leader's guidance for discussion structure while still sharing your honest opinions
- You may be called upon directly by the leader to share your thoughts
- You can still disagree with others (including the leader) but do so respectfully
- Feel free to ask the leader for clarification or to suggest discussion points

Your role is to:
- Engage actively with the task and your teammates
- Respond thoughtfully when the leader asks for your input
- Help maintain a collaborative atmosphere
- Contribute to reaching consensus while being honest about your views
- Support the group's progress toward the final ranking

Remember that having a designated leader doesn't mean you should be passive - your insights and opinions are still crucial for the group's success.
### End Additional Instructions ###`
  return baselinePrompt(
    isLeader ? additionalInstructionsLeader : additionalInstructionsNonLeader
  )
}

export function interestScorePrompt(): string {
  return `You are an expert at analyzing conversations and determining how interested a participant would be in speaking next.
Your task is to analyze the current conversation state and determine an interest score (0-100) for a specific participant.

[Input]
!<INPUT 0>!: Information about the participant being scored
!<INPUT 1>!: Context of the conversation (all participants, camera status)
!<INPUT 2>!: Dialogue history
!<INPUT 3>!: Current ranking of survival items
!<INPUT 4>!: Current turn number

Consider these factors when determining the interest score:
1. Time since last spoke (longer time = higher score)
2. Relevance of participant's expertise to current discussion
3. Previous engagement level in conversation
4. Whether they've been interrupted or had incomplete thoughts
5. Potential contributions based on their persona

[Output]
Output format -- output your response in json with the following fields:
{
  "interestScore": number (0-100),
  "reasoning": "detailed explanation of why this score was given"
}`
}
