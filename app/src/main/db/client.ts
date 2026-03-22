import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import * as schema from '../../db/schema'

let sqlite: Database.Database | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) throw new Error('Database not initialized')
  return db
}

function getMigrationsFolder(): string {
  const fromApp = join(app.getAppPath(), 'drizzle')
  if (existsSync(fromApp)) return fromApp
  return join(process.cwd(), 'drizzle')
}

export function initDb(): void {
  const file = join(app.getPath('userData'), 'cv.sqlite')
  sqlite = new Database(file)
  db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: getMigrationsFolder() })
}

export function closeDb(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}
