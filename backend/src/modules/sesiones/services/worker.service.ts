import { getEnvConfig } from '../../../config/env'
import { ClassificationResult } from '../../../shared/types'
import { InferenciaService } from './inferencia.service'
import { TelemetriaService } from './telemetria.service'

export interface WorkerSessionState {
  task_description: string
  end_time: string
}

export interface WorkerHooks {
  getCurrentLockedSession: () => Promise<WorkerSessionState | null>
  onCycleResult: (params: {
    classification: ClassificationResult | null
    title: string
    processName: string
  }) => Promise<void>
  onSessionExpired: () => Promise<void>
}

function getRandomMs(minSeconds: number, maxSeconds: number): number {
  const minMs = minSeconds * 1000
  const maxMs = maxSeconds * 1000
  const range = Math.max(maxMs - minMs, 0)
  return minMs + Math.floor(Math.random() * (range + 1))
}

export class WorkerService {
  private readonly env = getEnvConfig()
  private timer: NodeJS.Timeout | null = null
  private running = false

  constructor(
    private readonly telemetriaService: TelemetriaService,
    private readonly inferenciaService: InferenciaService,
    private readonly hooks: WorkerHooks
  ) {}

  start(): void {
    if (this.running) {
      return
    }

    this.running = true
    void this.tick()
  }

  stop(): void {
    this.running = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private scheduleNextTick(): void {
    const delay = getRandomMs(
      this.env.telemetryMinSeconds,
      this.env.telemetryMaxSeconds
    )

    this.timer = setTimeout(() => {
      void this.tick()
    }, delay)
  }

  private async tick(): Promise<void> {
    if (!this.running) {
      return
    }

    const session = await this.hooks.getCurrentLockedSession()
    if (!session) {
      this.stop()
      return
    }

    if (new Date().getTime() >= new Date(session.end_time).getTime()) {
      await this.hooks.onSessionExpired()
      this.stop()
      return
    }

    const activeWindow = await this.telemetriaService.readActiveWindow()
    if (activeWindow) {
      const classification = await this.inferenciaService.classify(
        session.task_description,
        activeWindow.title,
        activeWindow.processName
      )

      await this.hooks.onCycleResult({
        classification,
        title: activeWindow.title,
        processName: activeWindow.processName
      })
    }

    this.scheduleNextTick()
  }
}
