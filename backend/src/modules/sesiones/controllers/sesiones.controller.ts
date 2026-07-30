import { NextFunction, Request, Response } from 'express'

import { successResponse } from '../../../shared/utils/response.util'
import { StartSessionDtoParser } from '../dtos/start-session.dto'
import { SesionesService } from '../services/sesiones.service'

export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  startSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = StartSessionDtoParser.parse(req.body)
      const session = await this.sesionesService.start_session(dto)

      res.status(201).json(
        successResponse(
          session,
          'Sesión de Monk Mode iniciada en modo bloqueado'
        )
      )
    } catch (error) {
      next(error)
    }
  }

  getStatus = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = await this.sesionesService.getStatus()
      res
        .status(200)
        .json(successResponse(status, 'Estado de sesión recuperado'))
    } catch (error) {
      next(error)
    }
  }

  acknowledgeAlert = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const state = await this.sesionesService.acknowledgeAlert()
      res.status(200).json(successResponse(state, 'Alerta confirmada'))
    } catch (error) {
      next(error)
    }
  }
}
