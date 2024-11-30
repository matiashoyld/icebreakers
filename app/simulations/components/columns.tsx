'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'
import { ActionCell } from './action-cell'

type SimulationType = 'baseline' | 'leadership' | 'social' | 'gamification'

function getTypeStyles(type: SimulationType): string {
  switch (type) {
    case 'baseline':
      return 'bg-zinc-100 text-zinc-800'
    case 'leadership':
      return 'bg-blue-100 text-blue-800'
    case 'social':
      return 'bg-purple-100 text-purple-800'
    case 'gamification':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export type Simulation = {
  id: string
  createdAt: string
  simulationType: SimulationType
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
    accessorKey: 'simulationType',
    header: ({ column }) => {
      return (
        <div className='text-left'>
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Type
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue('simulationType') as SimulationType
      return (
        <div className='text-left'>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyles(
              type
            )}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'totalTurns',
    header: ({ column }) => {
      return (
        <div className='text-center'>
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Total Turns
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div className='text-center'>{row.getValue('totalTurns')}</div>
    },
  },
  {
    accessorKey: 'taskScore',
    header: ({ column }) => {
      return (
        <div className='text-center'>
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='whitespace-nowrap'
          >
            Task Score
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const score: number | null = row.getValue('taskScore')
      return (
        <div className='text-center'>
          {score !== null ? `${score.toFixed(2)}%` : 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: 'avgParticipation',
    header: ({ column }) => {
      return (
        <div className='text-center'>
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='whitespace-nowrap'
          >
            Avg. Participation
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const participation: number | undefined = row.getValue('avgParticipation')
      return (
        <div className='text-center'>
          {participation !== undefined ? `${participation.toFixed(2)}%` : 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: 'avgSatisfaction',
    header: ({ column }) => {
      return (
        <div className='text-center'>
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='whitespace-nowrap'
          >
            Avg. Satisfaction
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const satisfaction: number | null = row.getValue('avgSatisfaction')
      return (
        <div className='text-center'>
          {satisfaction !== null ? satisfaction.toFixed(2) : 'N/A'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className='text-right'>Actions</div>,
    cell: ({ row }) => {
      return (
        <div className='text-right'>
          <ActionCell simulation={row.original} />
        </div>
      )
    },
  },
]
