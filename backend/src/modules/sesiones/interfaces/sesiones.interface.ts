import { MonkSessionState, SessionBlockRecord } from '../../../shared/types'

export interface ISesionesRepository {
  readState(): Promise<MonkSessionState | null>
  saveState(state: MonkSessionState): Promise<void>
  clearPendingAlert(): Promise<MonkSessionState | null>
  appendCompletedBlock(record: SessionBlockRecord): Promise<void>
}
