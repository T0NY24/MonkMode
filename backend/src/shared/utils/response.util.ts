export function successResponse<T>(data: T, mensaje: string) {
  return {
    ok: true as const,
    data,
    mensaje
  }
}

export function errorResponse(error: string, mensaje: string) {
  return {
    ok: false as const,
    error,
    mensaje
  }
}
