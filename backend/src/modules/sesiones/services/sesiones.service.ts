import { randomUUID } from 'node:crypto'

import { AppError } from '../../../shared/errors/app-error'
import { MonkSessionState } from '../../../shared/types'
import { Sesion } from '../entities/sesion.entity'
import { ISesionesRepository } from '../interfaces/sesiones.interface'
import { WorkerService } from './worker.service'

interface StartSessionInput {
  task_description: string
  duration_minutes: number
}

export class SesionesService {
  constructor(
    private readonly sesionesRepository: ISesionesRepository,
    private readonly workerService: WorkerService
  ) {}

  async start_session(input: StartSessionInput): Promise<MonkSessionState> {
    const active = await this.sesionesRepository.readState()
    if (Sesion.isLocked(active)) {
      throw new AppError(
        'SESSION_LOCKED',
        'Ya existe una sesión bloqueada en curso',
        409
      )
    }

    const now = new Date()
    const end = new Date(now.getTime() + input.duration_minutes * 60_000)
    const state: MonkSessionState = {
      task_description: input.task_description,
      duration_minutes: input.duration_minutes,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      status: 'LOCKED',
      distraction_count: 0,
      alert_sequence: 0
    }

    await this.sesionesRepository.saveState(state)
    this.workerService.start()

    return state
  }

  async getStatus(): Promise<MonkSessionState | null> {
    const state = await this.sesionesRepository.readState()
    if (!state) {
      return null
    }

    if (state.status === 'LOCKED' && Sesion.isExpired(state)) {
      return this.completeCurrentSession(state)
    }

    return state
  }

  async acknowledgeAlert(): Promise<MonkSessionState | null> {
    return this.sesionesRepository.clearPendingAlert()
  }

  async resumeIfNeeded(): Promise<void> {
    const state = await this.sesionesRepository.readState()
    if (!state) {
      return
    }

    if (state.status === 'LOCKED' && !Sesion.isExpired(state)) {
      this.workerService.start()
      return
    }

    if (state.status === 'LOCKED' && Sesion.isExpired(state)) {
      await this.completeCurrentSession(state)
    }
  }

  async getCurrentLockedSession(): Promise<{
    task_description: string
    end_time: string
  } | null> {
    const state = await this.sesionesRepository.readState()
    if (!state || !Sesion.isLocked(state)) {
      return null
    }

    return {
      task_description: state.task_description,
      end_time: state.end_time
    }
  }

  async registerCycleResult(params: {
    title: string
    processName: string
    classification: { is_distraction: boolean; reason: string } | null
  }): Promise<void> {
    const state = await this.sesionesRepository.readState()
    if (!state || state.status !== 'LOCKED') {
      return
    }

    state.last_window = {
      title: params.title,
      processName: params.processName,
      capturedAt: new Date().toISOString()
    }

    if (params.classification) {
      state.last_classification = params.classification

      if (params.classification.is_distraction) {
        state.distraction_count += 1
        state.alert_sequence += 1
        state.pending_alert = {
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          reason: params.classification.reason,
          title: params.title,
          processName: params.processName
        }
      }
    }

    await this.sesionesRepository.saveState(state)
  }

  async onSessionExpired(): Promise<void> {
    const state = await this.sesionesRepository.readState()
    if (!state || state.status !== 'LOCKED') {
      return
    }

    await this.completeCurrentSession(state)
  }

  private async completeCurrentSession(
    state: MonkSessionState
  ): Promise<MonkSessionState> {
    const completedAt = new Date().toISOString()
    const completedState: MonkSessionState = {
      ...state,
      status: 'COMPLETED',
      completed_at: completedAt
    }

    await this.sesionesRepository.saveState(completedState)
    await this.sesionesRepository.appendCompletedBlock({
      task_description: completedState.task_description,
      duration_minutes: completedState.duration_minutes,
      start_time: completedState.start_time,
      end_time: completedState.end_time,
      completed_at: completedAt,
      distraction_count: completedState.distraction_count
    })

    return completedState
  }
}
