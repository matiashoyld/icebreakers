'use client'

import { EngagementData } from '@/app/types/types'
import React, { useEffect, useRef } from 'react'

/**
 * Displays the engagement chart for a given agent over time.
 *
 * @param data - Array of engagement data points.
 * @param agentId - The ID of the agent to display data for.
 * @returns A canvas element rendering the engagement chart.
 */
export const EngagementChart: React.FC<{
  data: EngagementData[]
  agentId: number
}> = ({ data, agentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const filteredData = data.filter((d) => d.agentId === agentId)
        const maxEngagement = 100
        const xStep = canvas.width / (filteredData.length - 1 || 1)
        const yStep = canvas.height / maxEngagement

        // Draw fading area
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, 'rgba(136, 132, 216, 0.3)')
        gradient.addColorStop(1, 'rgba(136, 132, 216, 0)')

        ctx.beginPath()
        ctx.moveTo(0, canvas.height)
        filteredData.forEach((point, index) => {
          const x = index * xStep
          const y = canvas.height - point.engagement * yStep
          ctx.lineTo(x, y)
        })
        ctx.lineTo((filteredData.length - 1) * xStep, canvas.height)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = '#8884d8'
        ctx.lineWidth = 2
        filteredData.forEach((point, index) => {
          const x = index * xStep
          const y = canvas.height - point.engagement * yStep
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw x-axis labels
        ctx.fillStyle = '#666'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        filteredData.forEach((point, index) => {
          const x = index * xStep
          ctx.fillText(point.turn.toString(), x, canvas.height - 5)
        })
      }
    }
  }, [data, agentId])

  return <canvas ref={canvasRef} width={300} height={200} className='w-full' />
}
