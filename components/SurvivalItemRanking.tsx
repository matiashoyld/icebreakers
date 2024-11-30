import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

interface SurvivalItemRankingProps {
  itemRanking: Array<
    | {
        id?: number
        name: string
        emoji: string
        initialRank?: number
      }
    | undefined
  >
  currentStep: number
}

export function SurvivalItemRanking({
  itemRanking,
  currentStep,
}: SurvivalItemRankingProps) {
  return (
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
                          <TableCell className='py-1'>{index + 1}</TableCell>
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
  )
}
