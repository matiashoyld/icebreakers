import { Scenario } from '@/components/ScenarioSelector'
import { Button } from '@/components/ui/button'
import { SimulationTurn } from '@/lib/services/simulation-service'
import { Loader2, Play, Save, SkipForward } from 'lucide-react'

interface SimulationControlsProps {
  onNextStep: () => void
  onPlaySimulation: () => void
  onEndSimulation: () => void
  isLoading: boolean
  isPlaying: boolean
  hasStarted: boolean
  currentStep: number
  loadingButton: 'next' | 'play' | 'save' | null
  simulationTurns: SimulationTurn[]
  selectedScenario: Scenario | null
}

export function SimulationControls({
  onNextStep,
  onPlaySimulation,
  onEndSimulation,
  isLoading,
  isPlaying,
  hasStarted,
  currentStep,
  loadingButton,
  simulationTurns,
  selectedScenario,
}: SimulationControlsProps) {
  return (
    <div className='flex items-center justify-between gap-6 w-full'>
      <div className='flex items-center gap-3'>
        <Button
          onClick={onNextStep}
          disabled={isLoading || isPlaying || !selectedScenario}
          className='w-28 h-9'
          variant={'ghost'}
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
          onClick={onPlaySimulation}
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

      <div className='px-4 py-1.5 bg-muted rounded-full'>
        <span className='text-sm font-medium'>
          Turn <span className='text-primary font-semibold'>{currentStep}</span>
        </span>
      </div>

      <Button
        onClick={onEndSimulation}
        disabled={isLoading || !hasStarted || simulationTurns.length === 0}
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
  )
}
