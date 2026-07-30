export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly mensaje: string,
    public readonly statusHttp: number = 500
  ) {
    super(mensaje)
  }
}
