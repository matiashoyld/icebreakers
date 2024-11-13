'use client'

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
import {
  Activity,
  BarChart,
  Brain,
  CameraOff,
  MessageSquare,
  Play,
  SkipForward,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Participant = {
  id: number
  name: string
  avatar: string
  cameraOn: boolean
  wordsSpoken: number
  timesDoingNothing: number
  cameraToggles: number
  participationRate: number
}

type SimulationStep = {
  participantId: number
  action: 'speak' | 'toggleCamera' | 'doNothing'
  message?: string
  thinking?: string
}

type Message = {
  id: number
  participantId: number
  content: string
}

type EngagementData = {
  turn: number
  engagement: number
  agentId: number
}

const initialParticipants: Participant[] = [
  {
    id: 1,
    name: 'Alice',
    avatar: '/images/alice.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 2,
    name: 'Bob',
    avatar: '/images/bob.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: '/images/charlie.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 4,
    name: 'Diana',
    avatar: '/images/diana.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
]

const simulationSteps: SimulationStep[] = [
  {
    participantId: 1,
    action: 'speak',
    message: 'Hi everyone, shall we start the discussion?',
    thinking: 'I should initiate the conversation to get things started.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: "Sure, what's our topic today?",
    thinking: "I'm interested in the topic and want to clarify our focus.",
  },
  {
    participantId: 3,
    action: 'toggleCamera',
    thinking:
      "I'm feeling a bit self-conscious and want to turn off my camera.",
  },
  {
    participantId: 4,
    action: 'speak',
    message: "I think we're discussing the latest AI developments.",
    thinking: 'I want to contribute by confirming the topic.',
  },
  {
    participantId: 1,
    action: 'speak',
    message:
      "That's right. What do you all think about the recent breakthroughs?",
    thinking: 'I should guide the discussion towards specific aspects of AI.',
  },
  {
    participantId: 2,
    action: 'doNothing',
    thinking: "I'm not sure what to say at this moment, so I'll stay quiet.",
  },
  {
    participantId: 3,
    action: 'speak',
    message:
      'I find it fascinating, especially in natural language processing.',
    thinking: 'I want to share my interest in a specific area of AI.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking:
      "I'm feeling more comfortable now and want to turn my camera back on.",
  },
  {
    participantId: 1,
    action: 'speak',
    message: 'Agreed. Any concerns about ethical implications?',
    thinking:
      'I should bring up potential challenges to deepen our discussion.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: 'Yes, I worry about privacy and job displacement.',
    thinking: "I want to express my concerns about AI's impact on society.",
  },
  {
    participantId: 3,
    action: 'speak',
    message: 'I think we need to consider the impact on education systems.',
    thinking: 'I want to expand the discussion to include societal impacts.',
  },
  {
    participantId: 4,
    action: 'doNothing',
    thinking: "I'm processing everyone's points and formulating my thoughts.",
  },
  {
    participantId: 1,
    action: 'speak',
    message:
      'Good point about education. AI could revolutionize personalized learning.',
    thinking: 'I should acknowledge and build upon the previous point.',
  },
  {
    participantId: 2,
    action: 'toggleCamera',
    thinking: 'Need to quickly step away for a moment.',
  },
  {
    participantId: 3,
    action: 'doNothing',
    thinking: 'Waiting to see if others want to contribute.',
  },
  {
    participantId: 4,
    action: 'speak',
    message:
      'What about the digital divide? Not everyone has equal access to AI tools.',
    thinking: 'I should raise concerns about accessibility and equality.',
  },
  {
    participantId: 2,
    action: 'toggleCamera',
    thinking: "I'm back and ready to participate again.",
  },
  {
    participantId: 1,
    action: 'speak',
    message: 'The digital divide is a crucial issue. How can we address this?',
    thinking:
      'This is a good opportunity to encourage problem-solving discussion.',
  },
  {
    participantId: 3,
    action: 'speak',
    message:
      'We could start with improving infrastructure in underserved areas.',
    thinking: 'Contributing a practical solution to the problem.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: 'And perhaps implement community AI learning centers?',
    thinking: 'Adding another concrete suggestion to the discussion.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking: 'Taking a quick break but still listening.',
  },
  {
    participantId: 1,
    action: 'doNothing',
    thinking: 'Letting others contribute to the discussion.',
  },
  {
    participantId: 3,
    action: 'speak',
    message: 'We should also consider multilingual AI accessibility.',
    thinking: 'Bringing up another important aspect of accessibility.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking: 'Returning to the discussion with video.',
  },
  {
    participantId: 2,
    action: 'speak',
    message:
      'These are all excellent points for creating an inclusive AI future.',
    thinking: 'Summarizing the key points of our discussion.',
  },
]

const getEngagementScore = () => {
  if (typeof window === 'undefined') return 0
  return Math.floor(Math.random() * 100)
}

const EngagementChart: React.FC<{
  data: EngagementData[]
  agentId: number
}> = ({ data, agentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const filteredData = data.filter((d) => d.agentId === agentId)
        const maxEngagement = 100
        const xStep = canvas.width / (filteredData.length - 1 || 1)
        const yStep = canvas.height / maxEngagement

        // Draw fading area
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, 'rgba(136, 132, 216, 0.3)')
        gradient.addColorStop(1, 'rgba(136, 132, 216, 0)')

        ctx.beginPath()
        ctx.moveTo(0, canvas.height)
        filteredData.forEach((point, index) => {
          const x = index * xStep
          const y = canvas.height - point.engagement * yStep
          ctx.lineTo(x, y)
        })
        ctx.lineTo((filteredData.length - 1) * xStep, canvas.height)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = '#8884d8'
        ctx.lineWidth = 2
        filteredData.forEach((point, index) => {
          const x = index * xStep
          const y = canvas.height - point.engagement * yStep
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw x-axis labels
        ctx.fillStyle = '#666'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        filteredData.forEach((point, index) => {
          const x = index * xStep
          ctx.fillText(point.turn.toString(), x, canvas.height - 5)
        })
      }
    }
  }, [data, agentId])

  return <canvas ref={canvasRef} width={300} height={200} className='w-full' />
}

const ENGAGEMENT_CHART_COLOR = '#8884d8'

export default function BreakoutRoomSimulator() {
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

  const getLatestEngagement = (participantId: number) => {
    const participantData = engagementData
      .filter((data) => data.agentId === participantId)
      .sort((a, b) => b.turn - a.turn)
    return participantData[0]?.engagement ?? 0
  }

  const handleNextStep = () => {
    if (currentStep < simulationSteps.length) {
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

            // Calculate participation rate based on actual turns participated
            const participatedTurns = simulationSteps
              .slice(0, currentStep + 1)
              .filter(
                (s) =>
                  s.participantId === p.id &&
                  (s.action === 'speak' || s.action === 'toggleCamera')
              ).length

            // Calculate participation rate as decimal (no need to multiply by 100)
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
    }
  }

  const handlePlaySimulation = () => {
    setIsPlaying(true)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentStep < simulationSteps.length) {
      timer = setTimeout(handleNextStep, 2000)
    } else if (currentStep >= simulationSteps.length) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep])

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
        <Card className='flex-grow flex flex-col shadow-none w-[60%]'>
          <CardContent className='flex-1 flex flex-col p-4 overflow-hidden'>
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
        <Card className='w-[40%] max-w-xl flex flex-col shadow-none'>
          <CardHeader className='flex-none'>
            <CardTitle>Agent Analysis</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 overflow-y-auto'>
            <div className='space-y-6'>
              {currentAgent && (
                <>
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
