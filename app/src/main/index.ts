import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { dirname, join } from 'path'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const LATEX_FILENAME = 'document.tex'

function getLatexFilePath(): string {
  return join(app.getPath('userData'), LATEX_FILENAME)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'darwin'
      ? {
          titleBarStyle: 'hiddenInset',
          trafficLightPosition: { x: 14, y: 14 }
        }
      : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // LaTeX compilation
  ipcMain.handle('compile-latex', async (_, tex: string) => {
    const { compileLaTeX } = await import('./latex')
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
    const fs = require('fs') as typeof import('fs')
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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
