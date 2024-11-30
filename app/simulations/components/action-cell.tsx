'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Simulation } from './columns'

interface ActionCellProps {
  simulation: Simulation
}

export function ActionCell({ simulation }: ActionCellProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this simulation?')) return

    try {
      const response = await fetch(`/api/simulations/${simulation.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete simulation')
      }

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error deleting simulation:', error)
      alert('Failed to delete simulation')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(simulation.id)}
        >
          Copy simulation ID
        </DropdownMenuItem>
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className='text-red-600'>
          Delete simulation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
