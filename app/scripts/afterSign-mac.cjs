/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * electron-builder can leave Electron Framework.framework signed with Electron's
 * upstream identity while the main executable is ad-hoc, which triggers
 * "different Team IDs" at dyld load on recent macOS. Re-sign nested code, then
 * the app bundle, all with the same ad-hoc identity.
 */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

module.exports = async function afterSignMac(context) {
  if (process.platform !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)
  if (!fs.existsSync(appPath)) {
    console.warn(`[afterSign-mac] Skip: not found ${appPath}`)
    return
  }

  const frameworksDir = path.join(appPath, 'Contents', 'Frameworks')
  if (fs.existsSync(frameworksDir)) {
    for (const name of fs.readdirSync(frameworksDir)) {
      const p = path.join(frameworksDir, name)
      if (name.endsWith('.framework') || name.endsWith('.app')) {
        execSync(`codesign --force --sign - ${JSON.stringify(p)}`, { stdio: 'inherit' })
      }
    }
  }

  execSync(`codesign --force --sign - ${JSON.stringify(appPath)}`, { stdio: 'inherit' })
  execSync(`codesign --verify --deep --strict --verbose=2 ${JSON.stringify(appPath)}`, {
    stdio: 'inherit',
  })
}
