import { Router } from 'express'

import { SesionesController } from './controllers/sesiones.controller'
import { SesionesRepository } from './repositories/sesiones.repository'
import { InferenciaService } from './services/inferencia.service'
import { SesionesService } from './services/sesiones.service'
import { TelemetriaService } from './services/telemetria.service'
import { WorkerService } from './services/worker.service'

export class SesionesModule {
  public readonly router: Router
  public readonly sesionesService: SesionesService

  constructor() {
    const sesionesRepository = new SesionesRepository()
    const telemetriaService = new TelemetriaService()
    const inferenciaService = new InferenciaService()

    let sesionesServiceRef: SesionesService | null = null
    const workerService = new WorkerService(
      telemetriaService,
      inferenciaService,
      {
        getCurrentLockedSession: async () =>
          sesionesServiceRef?.getCurrentLockedSession() || null,
        onCycleResult: async (params) =>
          sesionesServiceRef?.registerCycleResult(params),
        onSessionExpired: async () => sesionesServiceRef?.onSessionExpired()
      }
    )

    this.sesionesService = new SesionesService(sesionesRepository, workerService)
    sesionesServiceRef = this.sesionesService

    const sesionesController = new SesionesController(this.sesionesService)
    this.router = Router()
    this.router.post('/sessions/start', sesionesController.startSession)
    this.router.get('/sessions/status', sesionesController.getStatus)
    this.router.post('/sessions/ack-alert', sesionesController.acknowledgeAlert)
  }
}
