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
- If you were the last person to speak in the dialogue history, make this contribution coherent with that your comment. The flow of the conversation should feel natural. Use connectors like "also", "and", "also", etc.
- The activity ends when the group agrees on a final ranking
- If you don't have any ideas for ranking changes, you can submit an empty list. After 4 turns without any proposed changes, the activity will end.
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
"message": "If action is speak, include your message here. Otherwise null. It should be a coherent and natural response to the conversation.",
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
  return `[Input]
!<INPUT 0>!: Information about the participant being scored
!<INPUT 1>!: Context of the conversation (all participants, camera status)
!<INPUT 2>!: Dialogue history
!<INPUT 3>!: Current ranking of survival items
!<INPUT 4>!: Current turn number
!<INPUT 5>!: Previous interest scores for this participant
!<INPUT 6>!: Current scenario type and context

[Output]
Output format -- output your response in json with the following fields:
{
  "interestScore": number (0-100),
  "reasoning": "detailed explanation of why this score was given"
}

<commentblockmarker>###</commentblockmarker>

### Begin Context ###
You are a student in an online class breakout room with 3 other students. 

You are currently working on a survival scenario discussion. Where you have to rank 15 items from most important to least important.

### Begin Scenario Context ###
!<INPUT 6>!
### End Scenario Context ###
### End Context ###

### Begin Instructions ###
Your task is to analyze the current conversation state and determine your interest score (0-100). This interest score will be used to determine how likely you are to speak next.
To determine your interest score, you should consider:
1. Time since last spoke (longer time = higher score). This is important, if you have spoken too many times recently, your score should be lower. And if you haven't spoken recently, your score should be higher.
2. Relevance of participant's expertise to current discussion
3. Previous engagement level in conversation
4. Whether they've been interrupted or had incomplete thoughts
5. Potential contributions based on their persona
6. General interest in the topic and alignment with your personality and current context.
7. How well the current scenario type aligns with your personality traits and preferences
8. How pressured you feel to contribute taking into account the scenario context.

Important: don't be overly nice. Produce a realistic score based on the above factors. It can be a low score if you have nothing to contribute or you have already spoken a lot or your personality is not aligned with the current topic.
### End Instructions ###

### Begin Participant Description ###
!<INPUT 0>!
### End Participant Description ###

### Begin Conversation Context ###
!<INPUT 1>!
### End Conversation Context ###

### Begin Dialogue History ###
!<INPUT 2>!
### End Dialogue History ###

### Begin Current Ranking ###
!<INPUT 3>!
### End Current Ranking ###

### Begin Interest Score History ###
Previous interest scores for this participant:
!<INPUT 5>!
### End Interest Score History ###

Output format -- output your response in json with the following fields:
{
  "interestScore": number (0-100),
  "reasoning": "detailed explanation of why this score was given"
}`
}

export function satisfactionScorePrompt(): string {
  return `
[Input]
!<INPUT 0>!: Information about the agent persona, including name, speaking style, and description
!<INPUT 1>!: Conversation history
!<INPUT 2>!: Final group ranking of survival items
!<INPUT 3>!: Expert's optimal ranking of survival items

[Output]
Output format -- output your response in json with the following fields:
{
  "score": number between 1-10,
  "explanation": "detailed explanation for your score"
}

### Begin Context ###
You are an AI agent who just participated in a group conversation in an online class breakout room to solve a survival scenario. Review your agent description, the conversation history, and the group's performance, then provide a satisfaction score (1-10) along with an explanation for your rating. Consider factors such as:

1. How engaging was the conversation, given your personality and interests?
2. Did you feel your contributions were valued by the group?
3. Was there meaningful interaction that matched your speaking style and communication preferences?
4. Did the conversation flow naturally and accommodate your way of expressing yourself?
5. Were there any awkward moments or misunderstandings that particularly affected you?
6. How well did the group dynamics align with your speaking style and personality?
7. Were you able to communicate effectively in your preferred speaking style?
8. How successful was the group in reaching a good solution? Compare the final ranking to the expert ranking
9. Did the group make effective use of everyone's knowledge and perspectives?
10. How satisfied are you with the final outcome of the task?

Remember to stay true to your persona's characteristics and speaking style when assessing satisfaction. Your feedback will help improve future conversations.
### End Context ###

### Begin Agent Description ###
!<INPUT 0>!
### End Agent Description ###

### Begin Conversation History ###
!<INPUT 1>!
### End Conversation History ###

### Begin Final Results ###
Group's Final Ranking:
!<INPUT 2>!

Expert's Optimal Ranking:
!<INPUT 3>!
### End Final Results ###
`
}

// Add this helper function to get scenario context
export function getScenarioContext(
  scenarioType: 'baseline' | 'leadership' | 'social' | 'gamification',
  participantId?: number,
  leaderId?: number
): string {
  switch (scenarioType) {
    case 'leadership': {
      const isLeader = participantId === leaderId
      return `This is a leadership-focused scenario where one student has been designated as the group leader. ${
        isLeader
          ? 'You are the designated leader, responsible for facilitating discussion and ensuring everyone participates.'
          : "The leader is responsible for facilitating discussion and ensuring everyone participates. You are expected to engage while respecting the leader's guidance."
      }`
    }

    case 'social':
      return `This is a socially-focused scenario where students will anonymously rate their peers at the end of the discussion. Ratings are based on helpfulness, listening skills, and insight quality. This creates additional social dynamics and peer evaluation pressure.`

    case 'gamification':
      return `This is a gamified scenario where students can earn points and achievements:
- Making substantive contributions: +2 points
- Building on others' ideas: +3 points
- Helping reach consensus: +4 points
- Keeping camera on: +1 point per round
- Being inactive: -1 point
Students can also earn achievements like Survival Expert, Bridge Builder, and Active Listener.`

    default:
      return `This is a baseline scenario focused purely on completing the survival item ranking task through group discussion and consensus building.`
  }
}
