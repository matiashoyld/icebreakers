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
import { initialParticipants, simulationSteps } from '@/app/data/data'
import { EngagementData, Message, Participant } from '@/app/types/types'

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

  // Function to get the latest engagement score for a participant
  const getLatestEngagement = (participantId: number) => {
    const participantData = engagementData
      .filter((data) => data.agentId === participantId)
      .sort((a, b) => b.turn - a.turn)
    return participantData[0]?.engagement ?? 0
  }

  // Memoize handleNextStep with useCallback
  const handleNextStep = useCallback(() => {
    if (currentStep >= simulationSteps.length) {
      setIsPlaying(false)
      return
    }

    const step = simulationSteps[currentStep]
    const currentParticipant = participants.find(
      (p) => p.id === step.participantId
    )!

    setParticipants((prevParticipants) =>
      prevParticipants.map((p) => {
        if (p.id === step.participantId) {
          let updatedParticipant = { ...p }
          if (step.action === 'toggleCamera') {
            updatedParticipant.cameraOn = !p.cameraOn
            updatedParticipant.cameraToggles++
          } else if (step.action === 'speak' && step.message) {
            updatedParticipant.wordsSpoken += step.message.split(' ').length
          } else if (step.action === 'doNothing') {
            updatedParticipant.timesDoingNothing++
          }

          const participatedTurns = simulationSteps
            .slice(0, currentStep + 1)
            .filter(
              (s) =>
                s.participantId === p.id &&
                (s.action === 'speak' || s.action === 'toggleCamera')
            ).length

          updatedParticipant.participationRate =
            participatedTurns / (currentStep + 1)

          return updatedParticipant
        }
        return p
      })
    )

    if (step.action === 'speak' && step.message) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          participantId: step.participantId,
          content: step.message!,
        },
      ])
    }

    const newEngagement = getEngagementScore()
    setEngagementData((prevData) => [
      ...prevData,
      {
        turn: currentStep + 1,
        engagement: newEngagement,
        agentId: step.participantId,
      },
    ])

    setCurrentThinking(step.thinking || '')
    setCurrentAgent(currentParticipant)
    setCurrentDecision(
      `${step.action}${step.message ? `: "${step.message}"` : ''}`
    )
    setCurrentStep((prevStep) => prevStep + 1)
  }, [currentStep, participants, simulationSteps])

  // Handler to play the simulation automatically
  const handlePlaySimulation = () => {
    setIsPlaying(true)
  }

  // Update the useEffect to include handleNextStep in dependencies
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentStep < simulationSteps.length) {
      timer = setTimeout(handleNextStep, 2000)
    } else if (currentStep >= simulationSteps.length) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, handleNextStep, simulationSteps])

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
              <CardHeader className='flex-none'>
                <CardTitle>Dialogue</CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-hidden p-4'>
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
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
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
              </CardContent>
            </Card>
          </CardContent>
          {/* Control Buttons */}
          <CardFooter className='flex justify-between items-center'>
            <Button
              onClick={handleNextStep}
              disabled={isPlaying || currentStep >= simulationSteps.length}
            >
              <SkipForward className='mr-2 h-4 w-4' /> Next Step
            </Button>
            <div className='text-sm font-medium'>
              Turn: {currentStep} / {simulationSteps.length}
            </div>
            <Button
              onClick={handlePlaySimulation}
              disabled={isPlaying || currentStep >= simulationSteps.length}
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
