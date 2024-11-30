import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from 'lucide-react'

type Change = {
  item: { name: string; emoji: string }
  fromRank: number
  toRank: number
}

interface ProposedChangeProps {
  changes: Change[]
}

export function ProposedChanges({ changes }: ProposedChangeProps) {
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
