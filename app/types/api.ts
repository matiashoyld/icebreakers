import { Simulation } from '@prisma/client'

export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type SimulationResponse = ApiResponse<Simulation>
