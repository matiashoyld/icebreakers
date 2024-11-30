'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'
import { ActionCell } from './action-cell'

export type Simulation = {
  id: string
  createdAt: string
  context: string
  totalTurns: number
  taskScore: number | null
  avgParticipation: number
  avgSatisfaction: number | null
}

export const columns: ColumnDef<Simulation>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='whitespace-nowrap'
        >
          Date & Time
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='whitespace-nowrap'>
          {format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy, HH:mm:ss')}
        </div>
      )
    },
  },
  {
    accessorKey: 'context',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Context
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const context: string = row.getValue('context')
      return <div className='max-w-[200px] truncate'>{context}</div>
    },
  },
  {
    accessorKey: 'totalTurns',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-right'
        >
          Total Turns
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className='text-right'>{row.getValue('totalTurns')}</div>
    },
  },
  {
    accessorKey: 'taskScore',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='whitespace-nowrap'
        >
          Task Score
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score: number | null = row.getValue('taskScore')
      return score !== null ? `${score.toFixed(2)}%` : 'N/A'
    },
  },
  {
    accessorKey: 'avgParticipation',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='whitespace-nowrap'
        >
          Avg. Participation
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const participation: number | undefined = row.getValue('avgParticipation')
      return participation !== undefined
        ? `${participation.toFixed(2)}%`
        : 'N/A'
    },
  },
  {
    accessorKey: 'avgSatisfaction',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='whitespace-nowrap'
        >
          Avg. Satisfaction
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const satisfaction: number | null = row.getValue('avgSatisfaction')
      return satisfaction !== null ? satisfaction.toFixed(2) : 'N/A'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <ActionCell simulation={row.original} />
    },
  },
]
