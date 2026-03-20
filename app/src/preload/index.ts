import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface CompileResult {
  success: boolean
  pdfBase64?: string
  error?: string
}

// Custom APIs for renderer
const api = {
  compileLaTeX: (tex: string): Promise<CompileResult> =>
    ipcRenderer.invoke('compile-latex', tex),
  loadLaTeX: (): Promise<string | null> => ipcRenderer.invoke('load-latex'),
  saveLaTeX: (tex: string): Promise<void> => ipcRenderer.invoke('save-latex', tex),
  saveLaTeXSync: (tex: string): { ok: boolean; error?: string } =>
    ipcRenderer.sendSync('save-latex-sync', tex),
  platform: process.platform as NodeJS.Platform
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
