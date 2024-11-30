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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
// Icons
import {
  Activity,
  ArrowUpDown,
  BarChart,
  Brain,
  CameraOff,
  Loader2,
  MessageSquare,
  Play,
  Save,
  SkipForward,
} from 'lucide-react'

// Custom Components
import { EngagementChart } from '@/components/EngagementChart'
import { ProposedChanges } from '@/components/ProposedChanges'

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
  const [conversationContext, setConversationContext] = useState('')
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
        setHasStarted(true)
      }

      // Determine which participant's turn it is
      const currentParticipantId = (currentStep % participants.length) + 1

      console.log('About to get next step...')

      // Get next step from LLM
      const step = await getNextSimulationStep(
        {
          participants,
          currentTurn: currentStep,
          dialogueHistory,
          conversationContext,
          currentRanking: itemRanking.filter(
            (item): item is (typeof salvageItems)[0] => item !== undefined
          ),
        },
        currentParticipantId
      )

      // Move debug logs here, right after getting the step
      console.log('Full step object:', JSON.stringify(step, null, 2))
      console.log('Step ranking changes type:', typeof step.rankingChanges)
      console.log('Is array?', Array.isArray(step.rankingChanges))

      // Process any ranking changes requested by the agent
      if (step.rankingChanges && step.rankingChanges.length > 0) {
        console.log('Raw ranking changes:', step.rankingChanges)
        console.log('Current itemRanking:', itemRanking)

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

      console.log('itemRanking after setting:', itemRanking)

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
    conversationContext,
    hasStarted,
    itemRanking,
  ])

  // Handler to play the simulation automatically
  const handlePlaySimulation = () => {
    setLoadingButton('play')
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

  // Add function to end and save simulation
  const handleEndSimulation = async () => {
    setLoadingButton('save')
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: conversationContext,
          participants,
          turns: simulationTurns,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save simulation')
      }

      const { id } = await response.json()
      alert(`Simulation saved successfully! ID: ${id}`)
    } catch (error) {
      console.error('Error saving simulation:', error)
      alert('Failed to save simulation')
    } finally {
      setLoadingButton(null)
    }
  }

  // Add this near your other useEffects
  useEffect(() => {
    console.log('itemRanking changed:', itemRanking)
  }, [itemRanking])

  return (
    <div className='h-screen p-6'>
      <div className='flex gap-4 h-full'>
        {/* Add Ranking Table Panel */}
        <Card className='w-1/4 shadow-none overflow-hidden flex flex-col'>
          <CardHeader>
            <CardTitle>Survival Items Ranking</CardTitle>
          </CardHeader>
          <CardContent className='flex-grow overflow-hidden'>
            <ScrollArea className='h-[calc(100vh-10rem)] w-full'>
              <Table className='w-full'>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-xs font-medium'>Rank</TableHead>
                    <TableHead className='text-xs font-medium'>Item</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 15 }, (_, index) => {
                    const rankedItem = itemRanking[index]
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableRow
                              className={
                                index === currentStep - 1 ? 'bg-muted/50' : ''
                              }
                            >
                              <TableCell className='py-1'>
                                {index + 1}
                              </TableCell>
                              <TableCell className='py-1'>
                                {rankedItem ? (
                                  <motion.div
                                    initial={{
                                      backgroundColor:
                                        index === currentStep - 1
                                          ? 'rgba(59, 130, 246, 0.5)'
                                          : 'rgba(0, 0, 0, 0)',
                                    }}
                                    animate={{
                                      backgroundColor: 'rgba(0, 0, 0, 0)',
                                    }}
                                    transition={{ duration: 1 }}
                                  >
                                    {rankedItem.emoji} {rankedItem.name}
                                  </motion.div>
                                ) : (
                                  <span className='text-muted-foreground italic'>
                                    Not ranked yet
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          </TooltipTrigger>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Left Panel */}
        <Card className='flex-grow flex flex-col shadow-none w-[45%]'>
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
                    <div className='h-full flex flex-col mx-auto w-full'>
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
                      )

                      // Skip rendering if participant not found
                      if (!participant) return null

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
          <CardFooter className='flex items-center justify-center gap-6 border-t py-4'>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => handleNextStep()}
                disabled={
                  isLoading ||
                  isPlaying ||
                  (!hasStarted && !conversationContext.trim())
                }
                className='w-28 h-9'
                variant={!hasStarted ? 'default' : 'ghost'}
              >
                {!hasStarted ? (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Start
                  </>
                ) : loadingButton === 'next' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Wait...
                  </>
                ) : (
                  <>
                    <SkipForward className='mr-2 h-4 w-4' />
                    Next
                  </>
                )}
              </Button>

              <Button
                onClick={handlePlaySimulation}
                disabled={isLoading || !hasStarted}
                className='w-28 h-9'
                variant='ghost'
              >
                {loadingButton === 'play' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Wait...
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Play
                  </>
                )}
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='px-4 py-1.5 bg-muted rounded-full'>
                <span className='text-sm font-medium'>
                  Turn{' '}
                  <span className='text-primary font-semibold'>
                    {currentStep}
                  </span>
                </span>
              </div>

              <Button
                onClick={handleEndSimulation}
                disabled={
                  isLoading || !hasStarted || simulationTurns.length === 0
                }
                variant='ghost'
                className='w-28 h-9'
              >
                {loadingButton === 'save' ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Wait...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Right Panel - Agent Analysis */}
        <Card className='w-1/4 flex flex-col shadow-none'>
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
                    <div className='space-y-1'>
                      <h4 className='text-sm font-medium flex items-center'>
                        <ArrowUpDown className='w-4 h-4 mr-2' /> Proposed
                        Changes
                      </h4>
                      {proposedChanges.length > 0 ? (
                        <ProposedChanges changes={proposedChanges} />
                      ) : (
                        <p className='text-xs bg-muted p-2 rounded'>
                          No changes proposed at this time.
                        </p>
                      )}
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
