import { app, ipcMain } from 'electron'
import { dirname, join } from 'path'
import * as fs from 'node:fs'
import { mkdir, readFile, writeFile } from 'fs/promises'

const LATEX_FILENAME = 'document.tex'

function getLatexFilePath(): string {
  return join(app.getPath('userData'), LATEX_FILENAME)
}

export function registerLatexIpc(): void {
  // LaTeX compilation
  ipcMain.handle('compile-latex', async (_, tex: string) => {
    const { compileLaTeX } = await import('../latex')
    return compileLaTeX(tex)
  })

  ipcMain.handle('load-latex', async () => {
    try {
      return await readFile(getLatexFilePath(), 'utf-8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw error
    }
  })

  ipcMain.handle('save-latex', async (_, tex: string) => {
    const latexFilePath = getLatexFilePath()
    await mkdir(dirname(latexFilePath), { recursive: true })
    await writeFile(latexFilePath, tex, 'utf-8')
  })

  ipcMain.on('save-latex-sync', (event, tex: string) => {
    try {
      const latexFilePath = getLatexFilePath()
      fs.mkdirSync(dirname(latexFilePath), { recursive: true })
      fs.writeFileSync(latexFilePath, tex, 'utf-8')
      event.returnValue = { ok: true }
    } catch (error) {
      event.returnValue = {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
}
