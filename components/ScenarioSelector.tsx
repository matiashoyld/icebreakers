import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Crown, Target, Trophy, Users } from 'lucide-react'

export type Scenario = {
  id: 'baseline' | 'leadership' | 'social' | 'gamification'
  title: string
  shortDescription: string
  details: {
    description: string
    features: string[]
    objectives: string[]
  }
}

const scenarios: Scenario[] = [
  {
    id: 'baseline',
    title: 'Baseline',
    shortDescription: 'Standard breakout room with minimal structure',
    details: {
      description:
        'The baseline condition represents a standard breakout room with minimal structure. Agents are given the task and basic instructions without additional interventions.',
      features: [
        'Basic task instructions',
        'Natural group dynamics',
        'No additional structure',
        'Control condition for comparison',
      ],
      objectives: [
        'Observe natural group interaction patterns',
        'Establish baseline performance metrics',
        'Understand default participation levels',
      ],
    },
  },
  {
    id: 'leadership',
    title: 'Leadership Model',
    shortDescription: 'Structured leadership with designated facilitator',
    details: {
      description:
        'One agent is designated as the group leader with specific facilitation responsibilities. The leader guides discussion and helps reach consensus.',
      features: [
        'Designated group leader',
        'Structured facilitation',
        'Guided discussion flow',
        'Consensus-building focus',
      ],
      objectives: [
        'Test impact of structured leadership',
        'Improve group coordination',
        'Enhance decision-making efficiency',
      ],
    },
  },
  {
    id: 'social',
    title: 'Social Accountability',
    shortDescription: 'Peer rating system for mutual evaluation',
    details: {
      description:
        "Implements a peer rating system where agents know they will evaluate each other's contributions at the end of the session.",
      features: [
        'Peer evaluation system',
        'End-of-session ratings',
        'Contribution tracking',
        'Mutual accountability',
      ],
      objectives: [
        'Increase participant engagement',
        'Promote quality contributions',
        'Foster mutual responsibility',
      ],
    },
  },
  {
    id: 'gamification',
    title: 'Gamification',
    shortDescription: 'Point-based system with real-time feedback',
    details: {
      description:
        'Introduces a point-based system with real-time feedback and achievements to motivate participation and engagement.',
      features: [
        'Point-based rewards',
        'Real-time feedback',
        'Achievement system',
        'Progress tracking',
      ],
      objectives: [
        'Increase participation through rewards',
        'Provide immediate feedback',
        'Make discussion more engaging',
      ],
    },
  },
]

interface ScenarioSelectorProps {
  selectedScenario: Scenario | null
  onSelectScenario: (scenario: Scenario) => void
}

type IconProps = {
  size: number
  className: string
}

function getScenarioIcon(id: Scenario['id'], props: IconProps) {
  switch (id) {
    case 'baseline':
      return <Target {...props} />
    case 'leadership':
      return <Crown {...props} />
    case 'social':
      return <Users {...props} />
    case 'gamification':
      return <Trophy {...props} />
    default:
      return <Target {...props} />
  }
}

export function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
}: ScenarioSelectorProps) {
  return (
    <div className='flex gap-3 h-full min-h-0'>
      {/* Scenario List - Simplified */}
      <div className='w-1/3 min-h-0'>
        <ScrollArea className='h-full'>
          <div className='space-y-1.5 pr-3'>
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={cn(
                  'p-1.5 cursor-pointer transition-all hover:shadow-md w-full',
                  selectedScenario?.id === scenario.id
                    ? 'border-primary shadow-sm'
                    : 'hover:border-muted-foreground/25'
                )}
                onClick={() => onSelectScenario(scenario as Scenario)}
              >
                <div className='flex items-center gap-2 w-full'>
                  {getScenarioIcon(scenario.id, {
                    size: 14,
                    className: 'text-muted-foreground flex-shrink-0',
                  })}
                  <h3 className='text-xs font-medium leading-tight'>
                    {scenario.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Scenario Details - Scrollable */}
      <div className='w-2/3 min-h-0'>
        {selectedScenario ? (
          <Card className='h-full overflow-hidden'>
            <ScrollArea className='h-full'>
              <div className='p-3 space-y-3'>
                <div className='flex items-center gap-2'>
                  {getScenarioIcon(selectedScenario.id, {
                    size: 16,
                    className: 'text-muted-foreground flex-shrink-0',
                  })}
                  <h2 className='text-sm font-medium'>
                    {selectedScenario.title}
                  </h2>
                </div>

                <div className='space-y-3'>
                  <p className='text-xs text-muted-foreground'>
                    {selectedScenario.details.description}
                  </p>

                  <div>
                    <h3 className='text-xs font-semibold mb-1.5'>
                      Key Features
                    </h3>
                    <ul className='space-y-1'>
                      {selectedScenario.details.features.map((feature) => (
                        <li
                          key={feature}
                          className='text-xs text-muted-foreground flex items-start gap-2'
                        >
                          <span className='w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0' />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className='text-xs font-semibold mb-1.5'>Objectives</h3>
                    <ul className='space-y-1'>
                      {selectedScenario.details.objectives.map((objective) => (
                        <li
                          key={objective}
                          className='text-xs text-muted-foreground flex items-start gap-2'
                        >
                          <span className='w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0' />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <Card className='p-3 h-full flex items-center justify-center text-xs text-muted-foreground'>
            Select a scenario to see more details
          </Card>
        )}
      </div>
    </div>
  )
}
