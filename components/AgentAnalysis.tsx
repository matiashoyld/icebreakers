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
import { useCallback, useEffect, useRef, useState } from 'react'

interface AgentAnalysisProps {
  currentAgent: Participant | null
  currentThinking: string
  currentDecision: string
  getLatestEngagement: (id: number) => number
  proposedChanges: Array<{
    item: { name: string; emoji: string }
    fromRank: number
    toRank: number
  }>
  interestHistory: Array<{
    turn: number
    score: number
    participantId: number
  }>
}

// Main component should come first
export function AgentAnalysis({
  currentAgent,
  currentThinking,
  currentDecision,
  getLatestEngagement,
  proposedChanges,
  interestHistory,
}: AgentAnalysisProps) {
  if (!currentAgent) return null

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
              value={currentAgent ? getLatestEngagement(currentAgent.id) : 0}
              max={100}
              className='flex-grow h-2'
            />
            <span className='text-sm font-medium'>
              {currentAgent ? getLatestEngagement(currentAgent.id) : 0}%
            </span>
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
          <Activity className='w-4 h-4 mr-2' /> Interest Over Time
        </h4>
        <div className='h-[250px]'>
          <InterestChart
            data={interestHistory}
            agentId={currentAgent?.id || 0}
          />
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

// Helper components come after
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

function ProposedChanges({
  changes,
}: {
  changes: Array<{
    item: { name: string; emoji: string }
    fromRank: number
    toRank: number
  }>
}) {
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

interface DataPoint {
  turn: number
  score: number
  participantId: number
  x: number
  y: number
}

function InterestChart({
  data,
  agentId,
}: {
  data: Array<{
    turn: number
    score: number
    participantId: number
  }>
  agentId: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const mouseX = x * scaleX
      const mouseY = y * scaleY

      const filteredData = data
        .filter((d) => d.participantId === agentId)
        .map((point, index) => {
          const padding = {
            left: 30,
            right: 30,
            top: 10,
            bottom: 25,
          }
          const chartWidth = canvas.width - padding.left - padding.right
          const chartHeight = canvas.height - padding.top - padding.bottom
          const xStep =
            chartWidth /
            (data.filter((d) => d.participantId === agentId).length - 1 || 1)
          const yStep = chartHeight / 100

          return {
            ...point,
            x: (padding.left + index * xStep) * 2,
            y: (padding.top + (chartHeight - point.score * yStep)) * 2,
          }
        })

      const closest = filteredData.reduce((prev, curr) => {
        const prevDist = Math.hypot(prev.x - mouseX, prev.y - mouseY)
        const currDist = Math.hypot(curr.x - mouseX, curr.y - mouseY)
        return currDist < prevDist ? curr : prev
      })

      const distance = Math.hypot(closest.x - mouseX, closest.y - mouseY)
      setHoveredPoint(distance < 40 ? closest : null)
    },
    [data, agentId]
  )

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = canvas.clientWidth * 2
      canvas.height = canvas.clientHeight * 2

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(2, 2)

        const displayWidth = canvas.width / 2
        const displayHeight = canvas.height / 2

        const padding = {
          left: 30,
          right: 30,
          top: 10,
          bottom: 25,
        }

        const chartWidth = displayWidth - padding.left - padding.right
        const chartHeight = displayHeight - padding.top - padding.bottom

        ctx.clearRect(0, 0, displayWidth, displayHeight)

        const filteredData = data.filter((d) => d.participantId === agentId)
        const maxScore = 100
        const xStep = chartWidth / (filteredData.length - 1 || 1)
        const yStep = chartHeight / maxScore

        // Create points array
        const points = filteredData.map((point, index) => ({
          x: padding.left + index * xStep,
          y: padding.top + (chartHeight - point.score * yStep),
        }))

        if (points.length > 0) {
          // Draw fading area with curved top
          const gradient = ctx.createLinearGradient(
            0,
            padding.top,
            0,
            chartHeight + padding.top
          )
          gradient.addColorStop(0, 'rgba(136, 132, 216, 0.3)')
          gradient.addColorStop(1, 'rgba(136, 132, 216, 0)')

          ctx.beginPath()
          ctx.moveTo(points[0].x, chartHeight + padding.top)

          points.forEach((point, index) => {
            if (index === 0) {
              ctx.lineTo(point.x, point.y)
            } else {
              const prevPoint = points[index - 1]
              const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2
              const cp1y = prevPoint.y
              const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2
              const cp2y = point.y

              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y)
            }
          })

          ctx.lineTo(points[points.length - 1].x, chartHeight + padding.top)
          ctx.fillStyle = gradient
          ctx.fill()

          // Draw curved line
          ctx.beginPath()
          ctx.strokeStyle = '#8884d8'
          ctx.lineWidth = 2

          points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y)
            } else {
              const prevPoint = points[index - 1]
              const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2
              const cp1y = prevPoint.y
              const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2
              const cp2y = point.y

              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y)
            }
          })
          ctx.stroke()

          // Draw x-axis labels
          ctx.fillStyle = '#666'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'

          const labelInterval = Math.ceil(filteredData.length / 10)
          filteredData.forEach((point, index) => {
            if (
              index % labelInterval === 0 ||
              index === filteredData.length - 1
            ) {
              const x = padding.left + index * xStep
              ctx.fillText(
                point.turn.toString(),
                x,
                displayHeight - padding.bottom / 2
              )
            }
          })

          // Draw points
          points.forEach((point) => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
            ctx.fillStyle = '#8884d8'
            ctx.fill()
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.stroke()
          })
        }
      }
    }
  }, [data, agentId])

  return (
    <div className='relative w-full h-full'>
      <canvas
        ref={canvasRef}
        className='w-full h-full'
        style={{ maxHeight: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      />
      {hoveredPoint && (
        <div
          className='absolute bg-black/75 text-white px-2 py-1 rounded text-sm pointer-events-none'
          style={{
            left: `${hoveredPoint.x / 2}px`,
            top: `${hoveredPoint.y / 2 - 30}px`,
            transform: 'translateX(-50%)',
          }}
        >
          Turn {hoveredPoint.turn}: {hoveredPoint.score}%
        </div>
      )}
    </div>
  )
}
