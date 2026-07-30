import { MonkSessionState } from '../../../shared/types'

export class Sesion {
  static isLocked(state: MonkSessionState | null): boolean {
    if (!state) {
      return false
    }

    if (state.status !== 'LOCKED') {
      return false
    }

    return new Date().getTime() < new Date(state.end_time).getTime()
  }

  static isExpired(state: MonkSessionState): boolean {
    return new Date().getTime() >= new Date(state.end_time).getTime()
  }
}
