import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      compileLaTeX: (tex: string) => Promise<CompileResult>
      loadLaTeX: () => Promise<string | null>
      saveLaTeX: (tex: string) => Promise<void>
      saveLaTeXSync: (tex: string) => { ok: boolean; error?: string }
      platform: NodeJS.Platform
    }
  }
}
