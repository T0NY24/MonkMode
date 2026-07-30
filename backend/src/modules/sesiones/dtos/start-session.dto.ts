import { AppError } from '../../../shared/errors/app-error'

export interface StartSessionDto {
  task_description: string
  duration_minutes: number
}

export class StartSessionDtoParser {
  static parse(input: unknown): StartSessionDto {
    if (!input || typeof input !== 'object') {
      throw new AppError(
        'INVALID_BODY',
        'El cuerpo de la petición es inválido',
        400
      )
    }

    const data = input as Record<string, unknown>
    const taskDescription = data.task_description
    const durationMinutes = data.duration_minutes

    if (
      typeof taskDescription !== 'string' ||
      taskDescription.trim().length < 3
    ) {
      throw new AppError(
        'INVALID_TASK_DESCRIPTION',
        'La descripción de la tarea debe tener al menos 3 caracteres',
        400
      )
    }

    if (
      typeof durationMinutes !== 'number' ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes <= 0
    ) {
      throw new AppError(
        'INVALID_DURATION',
        'La duración debe ser un entero positivo en minutos',
        400
      )
    }

    return {
      task_description: taskDescription.trim(),
      duration_minutes: durationMinutes
    }
  }
}
