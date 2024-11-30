import { Message, Participant } from '@/app/types/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MessageItemProps {
  message: Message
  participant: Participant
}

export function MessageItem({ message, participant }: MessageItemProps) {
  return (
    <div className='flex items-start space-x-4 mb-4'>
      <Avatar className='h-10 w-10'>
        <AvatarImage
          src={participant.avatar}
          alt={participant.name}
          className='object-cover'
        />
        <AvatarFallback>{participant.name[0]}</AvatarFallback>
      </Avatar>
      <div className='space-y-1'>
        <p className='text-sm font-medium leading-none'>{participant.name}</p>
        <p className='text-sm text-muted-foreground'>{message.content}</p>
      </div>
    </div>
  )
}