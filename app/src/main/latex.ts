import { platform } from 'os'
import { spawn } from 'child_process'
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export interface CompileResult {
  success: boolean
  pdfBase64?: string
  error?: string
}

const TEX_PATHS: Record<string, string[]> = {
  darwin: ['/Library/TeX/texbin', '/usr/local/texlive/2025/bin/universal-darwin', '/usr/local/texlive/2024/bin/universal-darwin', '/usr/local/texlive/2023/bin/universal-darwin'],
  linux: ['/usr/bin', '/usr/local/texlive/2025/bin/x86_64-linux', '/usr/local/texlive/2024/bin/x86_64-linux', '/usr/local/texlive/2023/bin/x86_64-linux'],
  win32: []
}

function ensureTexInPath(): void {
  const paths = TEX_PATHS[platform()] ?? []
  const existing = paths.filter((p) => p.length > 0)
  if (existing.length === 0) return
  const sep = process.platform === 'win32' ? ';' : ':'
  const currentPath = process.env.PATH ?? ''
  if (currentPath.includes('/Library/TeX/texbin') || currentPath.includes('texlive')) return
  process.env.PATH = existing.join(sep) + sep + currentPath
}

function extractErrorFromLog(logContent: string): string {
  const lines = logContent.split('\n')
  const errors: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('!')) {
      errors.push(lines[i])
      if (lines[i + 1]) errors.push(lines[i + 1])
    }
  }
  return errors.length > 0 ? errors.join('\n') : logContent.slice(-500)
}

export async function compileLaTeX(tex: string): Promise<CompileResult> {
  ensureTexInPath()

  if (!tex.trim()) {
    return { success: false, error: 'Empty document' }
  }

  const workDir = await mkdtemp(join(tmpdir(), 'cv-latex-'))
  const texPath = join(workDir, 'document.tex')

  try {
    await writeFile(texPath, tex, 'utf8')

    const exitCode = await new Promise<number>((resolve, reject) => {
      const proc = spawn('pdflatex', ['-halt-on-error', '-interaction=nonstopmode', 'document.tex'], {
        cwd: workDir,
        env: process.env
      })
      proc.on('error', reject)
      proc.on('close', (code) => resolve(code ?? 1))
    })

    if (exitCode !== 0) {
      const logPath = join(workDir, 'document.log')
      let errorMsg = 'LaTeX compilation failed'
      try {
        const log = await readFile(logPath, 'utf8')
        errorMsg = extractErrorFromLog(log)
      } catch {
        // ignore
      }
      await rm(workDir, { recursive: true, force: true })
      return { success: false, error: errorMsg }
    }

    // Second pass for references/cross-refs
    const exitCode2 = await new Promise<number>((resolve) => {
      const proc = spawn('pdflatex', ['-halt-on-error', '-interaction=nonstopmode', 'document.tex'], {
        cwd: workDir,
        env: process.env
      })
      proc.on('close', (code) => resolve(code ?? 1))
    })

    const pdfPath = join(workDir, 'document.pdf')
    const pdfBuffer = await readFile(pdfPath)
    await rm(workDir, { recursive: true, force: true })

    if (exitCode2 !== 0) {
      return { success: false, error: 'Second pass failed' }
    }

    return {
      success: true,
      pdfBase64: pdfBuffer.toString('base64')
    }
  } catch (err) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}
