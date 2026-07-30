export interface SessionAlert {
  id: string
  createdAt: string
  reason: string
  title: string
  processName: string
}

export interface SessionStatus {
  task_description: string
  duration_minutes: number
  start_time: string
  end_time: string
  status: 'IDLE' | 'LOCKED' | 'COMPLETED'
  distraction_count: number
  alert_sequence: number
  pending_alert?: SessionAlert
  completed_at?: string
}

interface ApiResponse<T> {
  ok: boolean
  data: T
  mensaje: string
}

const runtimeWindow = window as Window & {
  __MONK_API_BASE_URL__?: string
}

const API_BASE_URL =
  runtimeWindow.__MONK_API_BASE_URL__ ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:4020'

export async function startSession(params: {
  task_description: string
  duration_minutes: number
}): Promise<SessionStatus> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error('No se pudo iniciar la sesión')
  }

  const payload = (await response.json()) as ApiResponse<SessionStatus>
  return payload.data
}

export async function getSessionStatus(): Promise<SessionStatus | null> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/status`)
  if (!response.ok) {
    throw new Error('No se pudo consultar el estado')
  }

  const payload = (await response.json()) as ApiResponse<SessionStatus | null>
  return payload.data
}

export async function acknowledgeAlert(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/sessions/ack-alert`, {
    method: 'POST'
  })
}
