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
      canvas.width = canvas.clientWidth * 2
      canvas.height = canvas.clientHeight * 2

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(2, 2)

        const displayWidth = canvas.width / 2
        const displayHeight = canvas.height / 2

        // Increase padding for better label visibility
        const padding = {
          left: 30,
          right: 30,
          top: 10,
          bottom: 25,
        }

        const chartWidth = displayWidth - padding.left - padding.right
        const chartHeight = displayHeight - padding.top - padding.bottom

        ctx.clearRect(0, 0, displayWidth, displayHeight)

        const filteredData = data.filter((d) => d.agentId === agentId)
        const maxEngagement = 100
        const xStep = chartWidth / (filteredData.length - 1 || 1)
        const yStep = chartHeight / maxEngagement

        // Create points array
        const points = filteredData.map((point, index) => ({
          x: padding.left + index * xStep,
          y: padding.top + (chartHeight - point.engagement * yStep),
        }))

        // Draw fading area with curved top
        const gradient = ctx.createLinearGradient(
          0,
          padding.top,
          0,
          chartHeight + padding.top
        )
        gradient.addColorStop(0, 'rgba(136, 132, 216, 0.3)')
        gradient.addColorStop(1, 'rgba(136, 132, 216, 0)')

        ctx.beginPath()
        // Start from bottom left
        ctx.moveTo(points[0].x, chartHeight + padding.top)

        // Draw curved top
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.lineTo(point.x, point.y)
          } else {
            const prevPoint = points[index - 1]
            const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2
            const cp1y = prevPoint.y
            const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2
            const cp2y = point.y

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y)
          }
        })

        // Complete the path back to bottom
        ctx.lineTo(points[points.length - 1].x, chartHeight + padding.top)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw curved line
        ctx.beginPath()
        ctx.strokeStyle = '#8884d8'
        ctx.lineWidth = 2

        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            const prevPoint = points[index - 1]
            const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2
            const cp1y = prevPoint.y
            const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2
            const cp2y = point.y

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y)
          }
        })
        ctx.stroke()

        // Draw x-axis labels with better spacing
        ctx.fillStyle = '#666'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'

        const labelInterval = Math.ceil(filteredData.length / 10)
        filteredData.forEach((point, index) => {
          if (
            index % labelInterval === 0 ||
            index === filteredData.length - 1
          ) {
            const x = padding.left + index * xStep
            ctx.fillText(
              point.turn.toString(),
              x,
              displayHeight - padding.bottom / 2
            )
          }
        })
      }
    }
  }, [data, agentId])

  return (
    <canvas
      ref={canvasRef}
      className='w-full h-full'
      style={{ maxHeight: '100%' }}
    />
  )
}
