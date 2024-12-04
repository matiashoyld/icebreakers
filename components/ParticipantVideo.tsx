import { Participant } from '@/app/types/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CameraOff } from 'lucide-react'

interface ParticipantVideoProps {
  participant: Participant
  isCurrentAgent: boolean
  latestEngagement: number
  engagementChartColor: string
}

export function ParticipantVideo({
  participant,
  isCurrentAgent,
  latestEngagement,
  engagementChartColor,
}: ParticipantVideoProps) {
  return (
    <div className='relative'>
      <div
        className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${
          isCurrentAgent
            ? `ring-2 ring-[${engagementChartColor}] ring-opacity-75`
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
        Interest: {Math.round(latestEngagement)}%
      </div>
    </div>
  )
}
