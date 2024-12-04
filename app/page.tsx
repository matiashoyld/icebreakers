'use client'

import { useToast } from '@/hooks/use-toast'
import { useCallback, useEffect, useRef, useState } from 'react'

// UI Components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
// Icons

// Custom Components
import { AgentAnalysis } from '@/components/AgentAnalysis'
import { MessageItem } from '@/components/Message'
import { ParticipantVideo } from '@/components/ParticipantVideo'
import { ScenarioSelector, type Scenario } from '@/components/ScenarioSelector'
import { SimulationControls } from '@/components/SimulationControls'
import { SimulationSummaryDialog } from '@/components/SimulationSummaryDialog'
import { SurvivalItemRanking } from '@/components/SurvivalItemRanking'
import { Toaster } from '@/components/ui/toaster'

// Data, Types, and Constants
import { ENGAGEMENT_CHART_COLOR } from '@/app/constants/constants'
import { initialParticipants, salvageItems } from '@/app/data/data'
import { Message, Participant, SimulationStep } from '@/app/types/types'
import { getNextSimulationStep } from '@/lib/simulation/simulation-manager'

type Change = {
  item: { name: string; emoji: string }
  fromRank: number
  toRank: number
}

export default function BreakoutRoomSimulator() {
  // State variables
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants)
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThinking, setCurrentThinking] = useState<string>('')
  const [currentAgent, setCurrentAgent] = useState<Participant | null>(null)
  const [currentDecision, setCurrentDecision] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [dialogueHistory, setDialogueHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [simulationTurns, setSimulationTurns] = useState<
    {
      turnNumber: number
      participantId: number
      action: string
      message?: string
      thinking: string
      decision: string
      engagementScore: number
      cameraStatus: boolean
      prompt: string
    }[]
  >([])

  // State to track the current ranking of survival items
  const [itemRanking, setItemRanking] = useState<
    ((typeof salvageItems)[0] | undefined)[]
  >([])
  const [proposedChanges, setProposedChanges] = useState<Change[]>([])

  // Add this with other state variables at the top
  const [loadingButton, setLoadingButton] = useState<
    'next' | 'play' | 'end' | null
  >(null)

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  )

  // Add this state to track if a step is in progress
  const [isStepInProgress, setIsStepInProgress] = useState(false)

  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)
  const [recentChanges, setRecentChanges] = useState<boolean[]>([])
  const [simulationEnded, setSimulationEnded] = useState(false)

  const [satisfactionScores, setSatisfactionScores] = useState<
    {
      participantId: number
      score: number
      explanation: string
    }[]
  >([])

  const { toast } = useToast()

  // Replace the existing engagementData state with interestScores
  const [interestScores, setInterestScores] = useState<
    {
      participantId: number
      score: number
    }[]
  >([])
  // Update the getLatestEngagement function
  const getLatestEngagement = (participantId: number) => {
    const participantScore = interestScores.find(
      (score) => score.participantId === participantId
    )
    return participantScore?.score ?? 0
  }

  // Add a function to calculate the task score consistently
  const calculateTaskScore = useCallback(() => {
    const rankingWithDiff = Array(15)
      .fill(null)
      .map((_, index) => {
        const correctItem = salvageItems[index]
        const rankedPosition =
          itemRanking.findIndex((item) => item?.name === correctItem.name) + 1

        if (rankedPosition !== -1) {
          // Item is ranked - difference between its current rank and real rank
          return Math.abs(rankedPosition - correctItem.realRank)
        } else {
          // Item is not ranked - difference is its real rank
          return correctItem.realRank
        }
      })

    return rankingWithDiff.reduce((sum, diff) => sum + diff, 0)
  }, [itemRanking])

  // Add this function to handle saving simulation data
  const saveSimulationData = useCallback(
    async (
      taskScore: number,
      satisfactionScores: {
        participantId: number
        score: number
        explanation: string
      }[]
    ) => {
      try {
        setLoadingButton('end')

        const response = await fetch('/api/simulations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            simulationType: selectedScenario!.id,
            participants,
            turns: simulationTurns,
            taskScore,
            satisfactionScores,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save simulation')
        }

        const { id } = await response.json()

        toast({
          title: 'Simulation Saved',
          description: `Simulation #${id} has been saved successfully.`,
          className: 'border-[0.5px] border-black bg-white',
        })
      } catch (error) {
        console.error('Error saving simulation:', error)
        toast({
          title: 'Error',
          description: 'Failed to save simulation. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoadingButton(null)
      }
    },
    [participants, selectedScenario, simulationTurns, toast]
  )

  // Add this function to collect satisfaction scores
  const collectSatisfactionScores = useCallback(async () => {
    const participantsWithInfo = participants.map((participant) => ({
      participantId: participant.id,
      agentDescription: `Name: ${participant.name}
        Speaking style: ${participant.speakingStyle}
        Agent description: ${participant.agentDescription}`,
    }))

    // Calculate final ranking from itemRanking
    const currentRanking = itemRanking
      .map((item, index) => {
        if (!item) return null
        return {
          name: item.name,
          rank: index + 1,
        }
      })
      .filter((item): item is { name: string; rank: number } => item !== null)
      .sort((a, b) => a.rank - b.rank)
      .map((item) => `${item.rank}. ${item.name}`)
      .join('\n')

    // Format the expert ranking as a string
    const expertRanking = [...salvageItems]
      .sort((a, b) => a.realRank - b.realRank)
      .map((item) => `${item.realRank}. ${item.name}`)
      .join('\n')

    const response = await fetch('/api/satisfaction-scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participants: participantsWithInfo,
        conversationHistory: dialogueHistory.join('\n'),
        finalRanking: currentRanking,
        expertRanking: expertRanking,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get satisfaction scores')
    }

    const scores = await response.json()
    setSatisfactionScores(scores)
    return scores
  }, [participants, dialogueHistory, itemRanking])

  // Add simulationSteps state
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([])
  // Modify handleNextStep to store interest scores
  const handleNextStep = useCallback(async () => {
    if (isLoading || isStepInProgress || simulationEnded) return

    setIsLoading(true)
    setLoadingButton('next')
    setIsStepInProgress(true)

    try {
      // Start the simulation if it hasn't started
      if (!hasStarted) {
        if (!selectedScenario) {
          throw new Error('Please select a scenario before starting')
        }
        setHasStarted(true)
      }

      // Get next step from LLM with interest-based participant selection
      const { step, nextParticipantId, endCondition, interestScores } =
        await getNextSimulationStep({
          participants,
          currentTurn: currentStep,
          dialogueHistory,
          conversationHistory: simulationSteps,
          currentRanking: itemRanking
            .map((item) =>
              item
                ? {
                    ...item,
                    realRank: itemRanking.indexOf(item) + 1,
                  }
                : null
            )
            .filter((item): item is (typeof salvageItems)[0] => item !== null),
          scenario: selectedScenario!,
          recentChanges,
          interestHistory,
        })

      // Store the interest scores
      setInterestScores(interestScores)
      setInterestHistory((prev) => [
        ...prev,
        ...interestScores.map((score) => ({
          turn: currentStep + 1,
          score: score.score,
          participantId: score.participantId,
        })),
      ])

      // Update recent changes
      const hadChanges = step.rankingChanges && step.rankingChanges.length > 0
      setRecentChanges((prev) =>
        [...prev, hadChanges]
          .slice(-4)
          .filter((change): change is boolean => change !== undefined)
      )

      // Handle simulation end
      if (endCondition.ended) {
        setSimulationEnded(true)
        setIsPlaying(false)
        const score = calculateTaskScore()
        const satisfactionScores = await collectSatisfactionScores()
        await saveSimulationData(score, satisfactionScores)
        setIsEndDialogOpen(true)
      }

      // Process any ranking changes requested by the agent
      if (step.rankingChanges && step.rankingChanges.length > 0) {
        const changes: Change[] = step.rankingChanges.map((change) => {
          const salvageItem = salvageItems.find((item) =>
            item.name.toLowerCase().includes(change.item.toLowerCase())
          )

          const existingItem = itemRanking.find(
            (item) => item?.name === salvageItem?.name
          )
          const currentRanking = existingItem
            ? itemRanking.findIndex(
                (item) => item?.name === salvageItem?.name
              ) + 1
            : 0

          return {
            item: {
              name: salvageItem?.name || change.item,
              emoji: salvageItem?.emoji || '',
            },
            fromRank: currentRanking,
            toRank: change.newRank,
          }
        })

        const newRanking = [...itemRanking]
        changes.forEach((change) => {
          const item = {
            name: change.item.name,
            emoji: change.item.emoji,
          }

          // Remove the item from its old position if it exists
          const oldIndex = newRanking.findIndex(
            (rankItem) => rankItem?.name === item.name
          )
          if (oldIndex !== -1) {
            newRanking[oldIndex] = undefined
          }

          // Place the item in its new position
          const targetIndex = change.toRank - 1
          newRanking[targetIndex] = {
            id: salvageItems.find((i) => i.name === change.item.name)?.id || 0,
            name: change.item.name,
            emoji: change.item.emoji,
            realRank: change.toRank,
          }
        })
        setItemRanking(newRanking)
        setProposedChanges(changes)
      } else {
        setProposedChanges([])
      }

      // Update participants state
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) => {
          if (p.id === nextParticipantId) {
            const updatedParticipant = { ...p }
            if (step.action === 'toggleCamera') {
              updatedParticipant.cameraOn = !p.cameraOn
              updatedParticipant.cameraToggles++
            } else if (step.action === 'speak' && step.message) {
              updatedParticipant.wordsSpoken += step.message.split(' ').length
              updatedParticipant.numberOfInteractions++
            } else if (step.action === 'doNothing') {
              updatedParticipant.timesDoingNothing++
            }

            const participatedTurns = currentStep + 1
            updatedParticipant.participationRate =
              participatedTurns / (currentStep + 1)

            return updatedParticipant
          }
          return p
        })
      )

      // Update messages if the agent spoke
      if (step.action === 'speak' && step.message) {
        const newMessage = {
          id: messages.length + 1,
          participantId: nextParticipantId,
          content: step.message,
        }
        setMessages((prev) => [...prev, newMessage])
        setDialogueHistory((prev) => [
          ...prev,
          `${prev.length + 1}. ${
            participants.find((p) => p.id === nextParticipantId)?.name
          }: ${step.message}`,
        ])
      }

      // Update current thinking and agent
      setCurrentThinking(step.thinking || '')
      setCurrentAgent(
        participants.find((p) => p.id === nextParticipantId) || null
      )
      setCurrentDecision(
        `${step.action}${step.message ? `: "${step.message}"` : ''}`
      )

      // Store turn data
      setSimulationTurns((prev) => [
        ...prev,
        {
          turnNumber: currentStep + 1,
          participantId: nextParticipantId,
          action: step.action,
          message: step.message,
          thinking: step.thinking || '',
          decision: step.action,
          engagementScore:
            interestScores.find(
              (score) => score.participantId === nextParticipantId
            )?.score ?? 0,
          cameraStatus:
            participants.find((p) => p.id === nextParticipantId)?.cameraOn ||
            false,
          prompt: step.prompt || '',
        },
      ])

      // Increment step
      setCurrentStep((prev) => prev + 1)

      // Add the step to simulation steps
      setSimulationSteps((prev) => [...prev, step])
    } catch (error) {
      console.error('Error in simulation step:', error)
      alert(
        'Error: ' +
          (error instanceof Error ? error.message : 'Something went wrong')
      )
      setIsPlaying(false)
    } finally {
      setIsStepInProgress(false)
      setLoadingButton(null)
      setIsLoading(false)
    }
  }, [
    currentStep,
    participants,
    messages,
    dialogueHistory,
    isLoading,
    selectedScenario,
    hasStarted,
    itemRanking,
    isStepInProgress,
    recentChanges,
    simulationEnded,
    saveSimulationData,
    calculateTaskScore,
    collectSatisfactionScores,
  ])

  // Modify handlePlayPauseSimulation function
  const handlePlayPauseSimulation = useCallback(() => {
    if (isStepInProgress) return

    if (isPlaying) {
      // If currently playing, pause it
      setIsPlaying(false)
      setLoadingButton(null)
    } else {
      // If currently paused, start playing
      setIsPlaying(true)
      setLoadingButton('play')

      // If simulation hasn't started, trigger the first step
      if (!hasStarted) {
        handleNextStep()
      }
    }
  }, [isPlaying, hasStarted, handleNextStep, isStepInProgress])

  // Modify the play simulation useEffect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const scheduleNextStep = () => {
      if (isPlaying && !isStepInProgress) {
        timeoutId = setTimeout(() => {
          handleNextStep()
        }, 2000)
      }
    }

    if (isPlaying && hasStarted && !isStepInProgress) {
      scheduleNextStep()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }, [isPlaying, hasStarted, handleNextStep, isStepInProgress])

  // Effect to auto-scroll the messages area
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Modify handleEndSimulation to use calculateTaskScore
  const handleEndSimulation = useCallback(async () => {
    setIsPlaying(false)
    setSimulationEnded(true)
    setIsEndDialogOpen(true)
    const score = calculateTaskScore()
    const satisfactionScores = await collectSatisfactionScores()
    await saveSimulationData(score, satisfactionScores)
  }, [calculateTaskScore, saveSimulationData, collectSatisfactionScores])

  // Add this state to track interest score history
  const [interestHistory, setInterestHistory] = useState<
    Array<{
      turn: number
      score: number
      participantId: number
    }>
  >([])

  return (
    <div className='h-screen p-6'>
      <div className='flex gap-4 h-full'>
        {/* Replace the existing ranking table with the new component */}
        <SurvivalItemRanking
          itemRanking={itemRanking}
          currentStep={currentStep}
        />

        {/* Left Panel */}
        <Card className='flex-grow flex flex-col shadow-none w-[45%]'>
          <CardContent className='flex-1 flex flex-col p-4 overflow-hidden'>
            {/* Participants Display */}
            <div className='grid grid-cols-2 gap-6 mb-6 min-h-fit'>
              {participants.map((participant) => (
                <ParticipantVideo
                  key={participant.id}
                  participant={participant}
                  isCurrentAgent={currentAgent?.id === participant.id}
                  latestEngagement={getLatestEngagement(participant.id)}
                  engagementChartColor={ENGAGEMENT_CHART_COLOR}
                />
              ))}
            </div>
            {/* Dialogue Section */}
            <Card className='flex-1 flex flex-col overflow-hidden shadow-none'>
              <CardContent className='flex-1 overflow-hidden pt-6'>
                {!hasStarted ? (
                  <div className='h-full flex flex-col'>
                    <div className='h-full flex flex-col mx-auto w-full'>
                      <h3 className='font-medium text-lg mb-4'>
                        Select Scenario
                      </h3>
                      <ScenarioSelector
                        selectedScenario={selectedScenario}
                        onSelectScenario={setSelectedScenario}
                      />
                    </div>
                  </div>
                ) : (
                  <ScrollArea
                    className='h-full w-full pr-4'
                    ref={scrollAreaRef}
                    scrollHideDelay={0}
                  >
                    {messages.map((message) => {
                      const participant = participants.find(
                        (p) => p.id === message.participantId
                      )

                      // Skip rendering if participant not found
                      if (!participant) return null

                      return (
                        <MessageItem
                          key={message.id}
                          message={message}
                          participant={participant}
                        />
                      )
                    })}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </CardContent>

          {/* Control Buttons */}
          <CardFooter>
            <SimulationControls
              onNextStep={handleNextStep}
              onPlayPauseSimulation={handlePlayPauseSimulation}
              onEndSimulation={handleEndSimulation}
              isLoading={isLoading}
              isPlaying={isPlaying}
              hasStarted={hasStarted}
              currentStep={currentStep}
              loadingButton={loadingButton}
              simulationTurns={simulationTurns}
              selectedScenario={selectedScenario}
              simulationEnded={simulationEnded}
            />
          </CardFooter>
        </Card>

        {/* Right Panel - Agent Analysis */}
        <Card className='w-1/4 flex flex-col shadow-none'>
          <CardHeader className='flex-none'>
            <CardTitle>Agent Analysis</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 overflow-y-auto'>
            <AgentAnalysis
              currentAgent={currentAgent}
              currentThinking={currentThinking}
              currentDecision={currentDecision}
              getLatestEngagement={getLatestEngagement}
              proposedChanges={proposedChanges}
              interestHistory={interestHistory}
            />
          </CardContent>
        </Card>
      </div>
      <SimulationSummaryDialog
        isOpen={isEndDialogOpen}
        onClose={() => setIsEndDialogOpen(false)}
        participants={participants}
        finalRanking={Array(15)
          .fill(null)
          .map((_, index) => {
            const itemAtPosition = itemRanking[index]
            const correctItem = salvageItems[index]

            if (itemAtPosition) {
              return {
                name: itemAtPosition.name,
                emoji: itemAtPosition.emoji,
                rank: index + 1,
                realRank:
                  salvageItems.findIndex(
                    (i) => i.name === itemAtPosition.name
                  ) + 1,
              }
            }

            return {
              name: correctItem.name,
              emoji: correctItem.emoji,
              rank: 0,
              realRank: correctItem.realRank,
            }
          })}
        totalTurns={currentStep}
        simulationType={selectedScenario?.id || 'baseline'}
        satisfactionScores={satisfactionScores}
        messages={messages}
      />
      <Toaster />
    </div>
  )
}
