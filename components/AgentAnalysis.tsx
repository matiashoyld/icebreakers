import { Participant } from '@/app/types/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  BarChart,
  Brain,
  MessageSquare,
  PlusIcon,
} from 'lucide-react'

type Change = {
  item: { name: string; emoji: string }
  fromRank: number
  toRank: number
}

interface AgentAnalysisProps {
  currentAgent: Participant | null
  currentThinking: string
  currentDecision: string
  getLatestEngagement: (participantId: number) => number
  proposedChanges: Change[]
}

export function AgentAnalysis({
  currentAgent,
  currentThinking,
  currentDecision,
  getLatestEngagement,
  proposedChanges,
}: AgentAnalysisProps) {
  if (!currentAgent) return null

  const interestScore = Math.round(getLatestEngagement(currentAgent.id))

  return (
    <div className='space-y-6'>
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
          <h3 className='font-semibold text-lg'>{currentAgent.name}</h3>
          <p className='text-sm text-muted-foreground'>Current Agent</p>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <h4 className='font-medium flex items-center'>
            <Brain className='w-4 h-4 mr-2' /> Thinking Process
          </h4>
          <p className='text-sm bg-muted p-2 rounded'>{currentThinking}</p>
        </div>

        <div className='space-y-2'>
          <h4 className='font-medium flex items-center'>
            <Activity className='w-4 h-4 mr-2' /> Current Interest
          </h4>
          <div className='flex items-center space-x-2'>
            <Progress
              value={interestScore}
              max={100}
              className='flex-grow h-2'
            />
            <span className='text-sm font-medium'>{interestScore}%</span>
          </div>
        </div>

        <div className='space-y-2'>
          <h4 className='font-medium flex items-center'>
            <MessageSquare className='w-4 h-4 mr-2' /> Decision
          </h4>
          <p className='text-sm bg-muted p-2 rounded'>{currentDecision}</p>
        </div>

        <div className='space-y-1'>
          <h4 className='text-sm font-medium flex items-center'>
            <ArrowUpDown className='w-4 h-4 mr-2' /> Proposed Changes
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

      <div>
        <h4 className='font-medium mb-2 flex items-center'>
          <BarChart className='w-4 h-4 mr-2' /> Agent Metrics
        </h4>
        <div className='grid grid-cols-2 gap-3'>
          <MetricCard label='Words spoken' value={currentAgent.wordsSpoken} />
          <MetricCard
            label='Times inactive'
            value={currentAgent.timesDoingNothing}
          />
          <MetricCard
            label='Camera toggles'
            value={currentAgent.cameraToggles}
          />
          <MetricCard
            label='Participation'
            value={`${(currentAgent.participationRate * 100).toFixed(0)}%`}
          />
        </div>
      </div>
    </div>
  )
}

// Helper components
function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className='bg-muted rounded-lg p-2'>
      <p className='text-xs text-muted-foreground mb-1'>{label}</p>
      <p className='text-lg font-bold'>{value}</p>
    </div>
  )
}

function ProposedChanges({ changes }: { changes: Change[] }) {
  return (
    <div className='space-y-2'>
      {changes.map((change, index) => {
        const isNewItem = change.fromRank === 0
        const isMovingUp = !isNewItem && change.toRank < change.fromRank
        const isMovingDown = !isNewItem && change.toRank > change.fromRank

        return (
          <div
            key={index}
            className='flex items-center space-x-2 bg-muted p-2 rounded text-xs'
          >
            <div className='flex-shrink-0'>
              {isNewItem && <PlusIcon className='h-4 w-4 text-blue-500' />}
              {isMovingUp && <ArrowUpIcon className='h-4 w-4 text-green-500' />}
              {isMovingDown && (
                <ArrowDownIcon className='h-4 w-4 text-red-500' />
              )}
            </div>
            <div className='flex-grow'>
              <span className='font-medium'>
                {change.item.emoji} {change.item.name}
              </span>
              <div className='text-muted-foreground'>
                {isNewItem
                  ? `Rank ${change.toRank}`
                  : `Rank ${change.fromRank} → ${change.toRank}`}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
