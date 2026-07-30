import { promises as fs } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { MonkSessionState, SessionBlockRecord } from '../../../shared/types'
import { ISesionesRepository } from '../interfaces/sesiones.interface'

export class SesionesRepository implements ISesionesRepository {
  private readonly basePath = join(homedir(), '.monkmode')
  private readonly logsPath = join(this.basePath, 'logs')
  private readonly sessionStatePath = join(this.basePath, 'session.json')
  private readonly blocksPath = join(this.logsPath, 'blocks.jsonl')

  async readState(): Promise<MonkSessionState | null> {
    await this.ensureStorage()

    try {
      const content = await fs.readFile(this.sessionStatePath, 'utf-8')
      return JSON.parse(content) as MonkSessionState
    } catch {
      return null
    }
  }

  async saveState(state: MonkSessionState): Promise<void> {
    await this.ensureStorage()
    await fs.writeFile(
      this.sessionStatePath,
      JSON.stringify(state, null, 2),
      'utf-8'
    )
  }

  async clearPendingAlert(): Promise<MonkSessionState | null> {
    const state = await this.readState()
    if (!state) {
      return null
    }

    delete state.pending_alert
    await this.saveState(state)
    return state
  }

  async appendCompletedBlock(record: SessionBlockRecord): Promise<void> {
    await this.ensureStorage()
    await fs.appendFile(
      this.blocksPath,
      `${JSON.stringify(record)}\n`,
      'utf-8'
    )
  }

  private async ensureStorage(): Promise<void> {
    await fs.mkdir(this.logsPath, { recursive: true })
  }
}
