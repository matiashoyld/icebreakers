'use client'

import { useToast } from '@/hooks/use-toast'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SimulationDashboard } from '@/components/SimulationDashboard'
import { useSimulationMetrics } from '@/hooks/useSimulationMetrics'

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
import { SurvivalItemRanking } from '@/components/SurvivalItemRanking'
import { Toaster } from '@/components/ui/toaster'

// Data, Types, and Constants
import {
  ENGAGEMENT_CHART_COLOR,
  getEngagementScore,
} from '@/app/constants/constants'
import { initialParticipants, salvageItems } from '@/app/data/data'
import { EngagementData, Message, Participant } from '@/app/types/types'
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
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
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
    'next' | 'play' | 'save' | null
  >(null)

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  )

  const { toast } = useToast()

  // Use the custom hook to get metrics
  const { stepMetrics, overallMetrics } = useSimulationMetrics(simulationTurns)

  // Function to get the latest engagement score for a participant
  const getLatestEngagement = (participantId: number) => {
    const participantData = engagementData
      .filter((data) => data.agentId === participantId)
      .sort((a, b) => b.turn - a.turn)
    return participantData[0]?.engagement ?? 0
  }

  // Modify handleNextStep to handle ranking changes
  const handleNextStep = useCallback(async () => {
    if (isLoading) return
    setLoadingButton('next')
    try {
      // Start the simulation if it hasn't started
      if (!hasStarted) {
        if (!selectedScenario) {
          throw new Error('Please select a scenario before starting')
        }
        setHasStarted(true)
      }

      // Determine which participant's turn it is
      const currentParticipantId = (currentStep % participants.length) + 1

      // Get next step from LLM
      const step = await getNextSimulationStep(
        {
          participants,
          currentTurn: currentStep,
          dialogueHistory,
          currentRanking: itemRanking.filter(
            (item): item is (typeof salvageItems)[0] => item !== undefined
          ),
          scenario: selectedScenario!,
        },
        currentParticipantId
      )

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
            initialRank: change.toRank,
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
          if (p.id === step.participantId) {
            const updatedParticipant = { ...p }
            if (step.action === 'toggleCamera') {
              updatedParticipant.cameraOn = !p.cameraOn
              updatedParticipant.cameraToggles++
            } else if (step.action === 'speak' && step.message) {
              updatedParticipant.wordsSpoken += step.message.split(' ').length
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
          participantId: step.participantId,
          content: step.message,
        }
        setMessages((prev) => [...prev, newMessage])
        setDialogueHistory((prev) => [
          ...prev,
          `${participants.find((p) => p.id === step.participantId)?.name}: ${
            step.message
          }`,
        ])
      }

      // Update current thinking and agent
      setCurrentThinking(step.thinking || '')
      setCurrentAgent(
        participants.find((p) => p.id === step.participantId) || null
      )
      setCurrentDecision(
        `${step.action}${step.message ? `: "${step.message}"` : ''}`
      )

      // Update engagement data
      const newEngagement = getEngagementScore()
      setEngagementData((prevData) => [
        ...prevData,
        {
          turn: currentStep + 1,
          engagement: newEngagement,
          agentId: step.participantId,
        },
      ])

      // Store turn data
      setSimulationTurns((prev) => [
        ...prev,
        {
          turnNumber: currentStep + 1,
          participantId: step.participantId,
          action: step.action,
          message: step.message,
          thinking: step.thinking || '',
          decision: step.action,
          engagementScore: newEngagement,
          cameraStatus:
            participants.find((p) => p.id === step.participantId)?.cameraOn ||
            false,
          prompt: step.prompt || '',
        },
      ])

      // Increment step
      setCurrentStep((prev) => prev + 1)
    } catch (error) {
      console.error('Error in simulation step:', error)
      alert(
        'Error: ' +
          (error instanceof Error ? error.message : 'Something went wrong')
      )
      setIsPlaying(false)
    } finally {
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
  ])

  // Modify handlePlaySimulation to toggle play/pause
  const handlePlayPauseSimulation = () => {
    if (isPlaying) {
      // If currently playing, pause it
      setIsPlaying(false)
      setLoadingButton(null)
    } else {
      // If currently paused, start playing
      setLoadingButton('play')
      setIsPlaying(true)

      // If simulation hasn't started, trigger the first step
      if (!hasStarted) {
        handleNextStep()
      }
    }
  }

  // Modify the play simulation useEffect to handle async
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && !isLoading) {
      timer = setTimeout(() => {
        handleNextStep()
      }, 2000)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, handleNextStep, isLoading])

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

  // Add function to end and save simulation
  const handleEndSimulation = async () => {
    setLoadingButton('save')
    try {
      if (!selectedScenario) {
        throw new Error('No scenario selected')
      }

      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants,
          turns: simulationTurns,
          simulationType: selectedScenario.id,
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
  }

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
              engagementData={engagementData}
            />
          </CardContent>
        </Card>
      </div>
      <Toaster />
      <SimulationDashboard stepMetrics={stepMetrics} overallMetrics={overallMetrics} />
    </div>
  )
}
