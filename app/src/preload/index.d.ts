import type { DbRequest, DbResult } from '../db/ipc'
import { ElectronAPI } from '@electron-toolkit/preload'
import type { CompileResult } from '../shared/latex-types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      compileLaTeX: (tex: string) => Promise<CompileResult>
      loadLaTeX: () => Promise<string | null>
      saveLaTeX: (tex: string) => Promise<void>
      saveLaTeXSync: (tex: string) => { ok: boolean; error?: string }
      db: {
        run: (req: DbRequest) => Promise<DbResult<unknown>>
      }
      platform: NodeJS.Platform
    }
  }
}
