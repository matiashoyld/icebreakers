import {
  SaveSimulationParams,
  getSimulations,
  saveSimulation,
} from '@/lib/services/simulation-service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveSimulationParams
    const simulation = await saveSimulation(body)
    return NextResponse.json(simulation)
  } catch (error) {
    console.error('Error in simulation API:', error)
    return NextResponse.json(
      { error: 'Failed to save simulation' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const simulations = await getSimulations()
    return NextResponse.json(simulations)
  } catch (error) {
    console.error('Error in simulation API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    )
  }
}
