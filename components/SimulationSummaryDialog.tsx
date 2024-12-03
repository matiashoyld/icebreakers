import { salvageItems } from '@/app/data/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Participant = {
  id: number
  name: string
  avatar: string
  wordsSpoken: number
  timesDoingNothing: number
  cameraToggles: number
  participationRate: number
  numberOfInteractions: number
}

type SimulationSummaryDialogProps = {
  isOpen: boolean
  onClose: () => void
  participants: Participant[]
  finalRanking: {
    name: string
    emoji: string
    rank: number
    realRank: number
  }[]
  totalTurns: number
  totalScore: number
}

type SalvageItem = {
  name: string
  emoji: string
}

export function SimulationSummaryDialog({
  isOpen,
  onClose,
  participants,
  finalRanking,
  totalTurns,
  totalScore,
}: SimulationSummaryDialogProps) {
  const averageWordsSpoken =
    participants.reduce((sum, p) => sum + p.wordsSpoken, 0) /
    participants.length
  const averageParticipationRate =
    participants.reduce((sum, p) => sum + p.participationRate, 0) /
    participants.length

  const rankingWithDiff = Array(15)
    .fill(null)
    .map((_, index) => {
      const correctItem = salvageItems[index]
      const rankedPosition = finalRanking.find(
        (item) => item.name === correctItem.name
      )

      if (rankedPosition && rankedPosition.rank > 0) {
        return {
          name: correctItem.name,
          emoji: correctItem.emoji,
          rank: rankedPosition.rank,
          realRank: correctItem.realRank,
          diff: Math.abs(rankedPosition.rank - correctItem.realRank),
        }
      } else {
        return {
          name: correctItem.name,
          emoji: correctItem.emoji,
          rank: 0, // Will be displayed as '-'
          realRank: correctItem.realRank,
          diff: correctItem.realRank,
        }
      }
    })
    .sort((a, b) => {
      // Put items with rank 0 (unranked) at the bottom
      if (a.rank === 0 && b.rank === 0) return 0
      if (a.rank === 0) return 1
      if (b.rank === 0) return -1
      // Sort ranked items by their current rank
      return a.rank - b.rank
    })

  const totalDiff = rankingWithDiff.reduce((sum, item) => sum + item.diff, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl h-[90vh] p-0 flex flex-col'>
        <ScrollArea className='flex-grow'>
          <div className='p-6 space-y-6'>
            <DialogHeader>
              <DialogTitle>Simulation Summary</DialogTitle>
              <DialogDescription>
                Overview of the icebreaker activity results after {totalTurns}{' '}
                turns
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{totalScore}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Average Words Spoken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {averageWordsSpoken.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Avg. Participation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {(averageParticipationRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Turns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{totalTurns}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Participant Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Words Spoken</TableHead>
                      <TableHead>Number of Interactions</TableHead>
                      <TableHead>Times Inactive</TableHead>
                      <TableHead>Camera Toggles</TableHead>
                      <TableHead>Participation Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage
                              src={participant.avatar}
                              alt={`${participant.name}'s avatar`}
                            />
                            <AvatarFallback>
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.wordsSpoken}</TableCell>
                        <TableCell>
                          {participant.numberOfInteractions}
                        </TableCell>
                        <TableCell>{participant.timesDoingNothing}</TableCell>
                        <TableCell>{participant.cameraToggles}</TableCell>
                        <TableCell>
                          {(participant.participationRate * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Final Item Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Current Rank</TableHead>
                      <TableHead>Real Rank</TableHead>
                      <TableHead>Diff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankingWithDiff.map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell>{`${item.emoji} ${item.name}`}</TableCell>
                        <TableCell>
                          {item.rank === 0 ? '-' : item.rank}
                        </TableCell>
                        <TableCell>{item.realRank}</TableCell>
                        <TableCell>{item.diff}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className='font-bold'>
                        Total Difference
                      </TableCell>
                      <TableCell className='font-bold'>{totalDiff}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}