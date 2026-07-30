import { NextFunction, Request, Response } from 'express'

import { AppError } from '../errors/app-error'
import { errorResponse } from '../utils/response.util'

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    res
      .status(error.statusHttp)
      .json(errorResponse(error.code, error.mensaje))
    return
  }

  res
    .status(500)
    .json(errorResponse('INTERNAL_ERROR', 'Ocurrió un error interno'))
}
