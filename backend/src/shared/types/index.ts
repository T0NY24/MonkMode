export type SessionStatus = 'IDLE' | 'LOCKED' | 'COMPLETED'

export interface ActiveWindowSample {
  title: string
  processName: string
  capturedAt: string
}

export interface ClassificationResult {
  is_distraction: boolean
  reason: string
}

export interface SessionAlert {
  id: string
  createdAt: string
  reason: string
  title: string
  processName: string
}

export interface MonkSessionState {
  task_description: string
  duration_minutes: number
  start_time: string
  end_time: string
  status: SessionStatus
  distraction_count: number
  alert_sequence: number
  pending_alert?: SessionAlert
  last_window?: ActiveWindowSample
  last_classification?: ClassificationResult
  completed_at?: string
}

export interface SessionBlockRecord {
  task_description: string
  duration_minutes: number
  start_time: string
  end_time: string
  completed_at: string
  distraction_count: number
}
