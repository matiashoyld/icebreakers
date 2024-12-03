import { MAX_SIMULATION_TURNS } from '@/app/constants/constants'
import { Scenario } from '@/components/ScenarioSelector'
import { Button } from '@/components/ui/button'
import { SimulationTurn } from '@/lib/services/simulation-service'
import { Loader2, Pause, Play, SkipForward, Square } from 'lucide-react'

interface SimulationControlsProps {
  onNextStep: () => void
  onPlayPauseSimulation: () => void
  onEndSimulation: () => void
  isLoading: boolean
  isPlaying: boolean
  hasStarted: boolean
  currentStep: number
  loadingButton: 'next' | 'play' | 'end' | null
  simulationTurns: SimulationTurn[]
  selectedScenario: Scenario | null
}

export function SimulationControls({
  onNextStep,
  onPlayPauseSimulation,
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
          {!isPlaying && loadingButton === 'next' ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Wait...
            </>
          ) : !hasStarted ? (
            <>
              <Play className='mr-2 h-4 w-4' />
              Start
            </>
          ) : (
            <>
              <SkipForward className='mr-2 h-4 w-4' />
              Next
            </>
          )}
        </Button>

        <Button
          onClick={onPlayPauseSimulation}
          disabled={
            !selectedScenario || (!isPlaying && loadingButton === 'next')
          }
          className='w-28 h-9'
          variant='ghost'
        >
          {loadingButton === 'play' ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Wait...
            </>
          ) : isPlaying ? (
            <>
              <Pause className='mr-2 h-4 w-4' />
              Pause
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
        <span className='text-sm font-medium whitespace-nowrap'>
          Turn{' '}
          <span className='text-primary font-semibold'>
            {currentStep}/{MAX_SIMULATION_TURNS}
          </span>
        </span>
      </div>

      <Button
        onClick={onEndSimulation}
        disabled={isLoading || !hasStarted || simulationTurns.length === 0}
        variant='ghost'
        className='w-28 h-9'
      >
        {loadingButton === 'end' ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Wait...
          </>
        ) : (
          <>
            <Square className='mr-2 h-4 w-4' />
            End
          </>
        )}
      </Button>
    </div>
  )
}
