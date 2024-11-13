'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
// Icons
import {
  Activity,
  BarChart,
  Brain,
  CameraOff,
  MessageSquare,
  Play,
  SkipForward,
} from 'lucide-react'

// Custom Components
import { EngagementChart } from '@/components/EngagementChart'

// Data, Types, and Constants
import {
  ENGAGEMENT_CHART_COLOR,
  getEngagementScore,
} from '@/app/constants/constants'
import { initialParticipants } from '@/app/data/data'
import { EngagementData, Message, Participant } from '@/app/types/types'
import { getNextSimulationStep } from '@/lib/simulation/simulation-manager'

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
  const [conversationContext, setConversationContext] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  // Function to get the latest engagement score for a participant
  const getLatestEngagement = (participantId: number) => {
    const participantData = engagementData
      .filter((data) => data.agentId === participantId)
      .sort((a, b) => b.turn - a.turn)
    return participantData[0]?.engagement ?? 0
  }

  // Modify handleNextStep to be async and use the LLM
  const handleNextStep = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Start the simulation if it hasn't started
      if (!hasStarted) {
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
          conversationContext,
        },
        currentParticipantId
      )

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
      setIsLoading(false)
    }
  }, [
    currentStep,
    participants,
    messages,
    dialogueHistory,
    isLoading,
    conversationContext,
    hasStarted,
  ])

  // Handler to play the simulation automatically
  const handlePlaySimulation = () => {
    setIsPlaying(true)
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

  return (
    <div className='h-screen p-6'>
      <div className='flex gap-4 h-full'>
        {/* Left Panel */}
        <Card className='flex-grow flex flex-col shadow-none w-[60%]'>
          <CardContent className='flex-1 flex flex-col p-4 overflow-hidden'>
            {/* Participants Display */}
            <div className='grid grid-cols-2 gap-6 mb-6 min-h-fit'>
              {participants.map((participant) => (
                <div key={participant.id} className='relative'>
                  <div
                    className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${
                      currentAgent?.id === participant.id
                        ? `ring-2 ring-[${ENGAGEMENT_CHART_COLOR}] ring-opacity-75`
                        : ''
                    }`}
                  >
                    {participant.cameraOn ? (
                      <div className='w-full h-full'>
                        <Avatar className='w-full h-full rounded-lg'>
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                            className='object-cover w-full h-full'
                          />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <CameraOff
                        className='w-16 h-16 text-muted-foreground'
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className='absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-sm'>
                    {participant.name}
                  </div>
                  <div className='absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-sm'>
                    Engagement: {getLatestEngagement(participant.id)}%
                  </div>
                </div>
              ))}
            </div>
            {/* Dialogue Section */}
            <Card className='flex-1 flex flex-col overflow-hidden shadow-none'>
              <CardContent className='flex-1 overflow-hidden pt-6'>
                {!hasStarted ? (
                  <div className='h-full flex flex-col'>
                    <div className='h-full flex flex-col max-w-2xl mx-auto w-full'>
                      <div className='space-y-2'>
                        <h3 className='font-semibold text-2xl'>
                          Set the Context
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          Describe the situation and what the participants
                          should discuss. This will help guide their
                          conversation.
                        </p>
                      </div>
                      <Textarea
                        className='flex-1 resize-none text-base mt-3'
                        placeholder='Example: This is a team meeting to discuss the upcoming product launch. The team needs to decide on the launch date and marketing strategy.'
                        value={conversationContext}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setConversationContext(e.target.value)
                        }
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
                      )!
                      return (
                        <div
                          key={message.id}
                          className='flex items-start space-x-4 mb-4'
                        >
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.name}
                              className='object-cover'
                            />
                            <AvatarFallback>
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className='space-y-1'>
                            <p className='text-sm font-medium leading-none'>
                              {participant.name}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {message.content}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </CardContent>
          {/* Control Buttons */}
          <CardFooter className='flex justify-between items-center'>
            <Button
              onClick={() => handleNextStep()}
              disabled={
                isPlaying ||
                isLoading ||
                (!hasStarted && !conversationContext.trim())
              }
            >
              {!hasStarted ? (
                'Start Simulation'
              ) : isLoading ? (
                'Processing...'
              ) : (
                <>
                  <SkipForward className='mr-2 h-4 w-4' /> Next Step
                </>
              )}
            </Button>
            <div className='text-sm font-medium'>Turn: {currentStep}</div>
            <Button
              onClick={handlePlaySimulation}
              disabled={isPlaying || isLoading || !hasStarted}
            >
              <Play className='mr-2 h-4 w-4' /> Play Simulation
            </Button>
          </CardFooter>
        </Card>

        {/* Right Panel - Agent Analysis */}
        <Card className='w-[40%] max-w-xl flex flex-col shadow-none'>
          <CardHeader className='flex-none'>
            <CardTitle>Agent Analysis</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 overflow-y-auto'>
            <div className='space-y-6'>
              {currentAgent && (
                <>
                  {/* Current Agent Info */}
                  <div className='flex items-center space-x-4'>
                    <Avatar className='w-12 h-12'>
                      <AvatarImage
                        src={currentAgent.avatar}
                        alt={currentAgent.name}
                        className='object-cover'
                      />
                      <AvatarFallback>{currentAgent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='font-semibold text-lg'>
                        {currentAgent.name}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Current Agent
                      </p>
                    </div>
                  </div>
                  {/* Agent Details */}
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium flex items-center'>
                        <Brain className='w-4 h-4 mr-2' /> Thinking Process
                      </h4>
                      <p className='text-sm bg-muted p-2 rounded'>
                        {currentThinking}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-medium flex items-center'>
                        <Activity className='w-4 h-4 mr-2' /> Current Engagement
                      </h4>
                      <div className='flex items-center space-x-2'>
                        <Progress
                          value={
                            currentAgent
                              ? getLatestEngagement(currentAgent.id)
                              : 0
                          }
                          max={100}
                          className='flex-grow h-2'
                        />
                        <span className='text-sm font-medium'>
                          {currentAgent
                            ? getLatestEngagement(currentAgent.id)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-medium flex items-center'>
                        <MessageSquare className='w-4 h-4 mr-2' /> Decision
                      </h4>
                      <p className='text-sm bg-muted p-2 rounded'>
                        {currentDecision}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  {/* Agent Metrics */}
                  <div>
                    <h4 className='font-medium mb-2 flex items-center'>
                      <BarChart className='w-4 h-4 mr-2' /> Agent Metrics
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-muted rounded-lg p-2'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Words spoken
                        </p>
                        <p className='text-lg font-bold'>
                          {currentAgent.wordsSpoken}
                        </p>
                      </div>
                      <div className='bg-muted rounded-lg p-2'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Times inactive
                        </p>
                        <p className='text-lg font-bold'>
                          {currentAgent.timesDoingNothing}
                        </p>
                      </div>
                      <div className='bg-muted rounded-lg p-2'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Camera toggles
                        </p>
                        <p className='text-lg font-bold'>
                          {currentAgent.cameraToggles}
                        </p>
                      </div>
                      <div className='bg-muted rounded-lg p-2'>
                        <p className='text-xs text-muted-foreground mb-1'>
                          Participation
                        </p>
                        <p className='text-lg font-bold'>
                          {(currentAgent.participationRate * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {/* Engagement Chart */}
                  <div>
                    <h4 className='font-medium mb-2 flex items-center'>
                      <Activity className='w-4 h-4 mr-2' /> Engagement Over Time
                    </h4>
                    <div className='h-[250px]'>
                      <EngagementChart
                        data={engagementData}
                        agentId={currentAgent.id}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
