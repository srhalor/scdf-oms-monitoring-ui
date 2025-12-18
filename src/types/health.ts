export type HealthStatus = 'UP' | 'DOWN' | 'DEGRADED'

export interface HealthResponse {
  status: HealthStatus
}
