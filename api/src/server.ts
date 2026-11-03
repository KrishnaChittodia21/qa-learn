import { MongoClient } from 'mongodb'
import { ensureAccountIndexes } from './account.ts'
import { buildApp } from './app.ts'
import { ensureAuthIndexes } from './auth.ts'
import { loadConfig } from './config.ts'
import { ensurePracticeIndexes } from './practice.ts'
import { ensureAnswerKeyIndexes } from './sync-answer-keys.ts'

const config = loadConfig()

// fail fast instead of hanging for 30 s when Atlas is unreachable (wrong IP allowlist, bad password)
// ignoreUndefined: an unset optional field stays absent; storing it as null breaks code that expects "missing"
const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true })
await client.connect()
const db = client.db(config.mongoDb)
await Promise.all([ensureAuthIndexes(db), ensureAnswerKeyIndexes(db), ensurePracticeIndexes(db), ensureAccountIndexes(db)])

const app = await buildApp(config, { db })
app.addHook('onClose', () => client.close())

// the host sends SIGTERM on every deploy: finish in-flight requests, then exit
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => app.close().then(() => process.exit(0)))
}

await app.listen({ port: config.port, host: config.host })
