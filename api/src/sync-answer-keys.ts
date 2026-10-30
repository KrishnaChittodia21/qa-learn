// Copies the answer key, coding solutions and company answers from src/content into the qa_learn database (M1).
// Runs on every deploy: `npm run sync:answers [-- --allow-delete]`. Unchanged items are skipped by contentHash;
// items removed from the content are deleted. Adapted from system-design-learn's api/src/sync-answer-keys.ts.
import { fileURLToPath } from 'node:url'
import { MongoClient, type AnyBulkWriteOperation, type Db } from 'mongodb'
import { buildAnswerKey, type KeyDoc } from '../../scripts/content-split.ts'

export type AnswerSets = Awaited<ReturnType<typeof buildAnswerKey>>

export async function ensureAnswerKeyIndexes(db: Db) {
  await Promise.all([
    db.collection('answer_keys').createIndex({ topicId: 1 }),
    db.collection('company_questions').createIndex({ topicId: 1 }),
  ])
}

/** Writes each set into its collection; returns a line per collection. Checks every set before writing any, so a
 * set that would delete too much (a broken content load would otherwise wipe the collection) changes nothing. */
export async function syncAnswerKeys(db: Db, sets: AnswerSets, { allowDelete = false } = {}) {
  const plans = []
  for (const [name, docs] of Object.entries(sets)) {
    const col = db.collection<KeyDoc>(name)
    const stored = await col.find({}, { projection: { contentHash: 1 } }).toArray()
    const have = new Map(stored.map((d) => [d._id, d.contentHash]))
    const ids = new Set(docs.map((d) => d._id))
    const gone = [...have.keys()].filter((id) => !ids.has(id))
    if (gone.length > Math.max(10, docs.length / 10) && !allowDelete) {
      throw new Error(`${name}: refusing to delete ${gone.length} of ${have.size} items; rerun with --allow-delete if intended`)
    }
    const ops: AnyBulkWriteOperation<KeyDoc>[] = docs
      .filter((d) => have.get(d._id) !== d.contentHash)
      .map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true } }))
    plans.push({ name, col, docs, ops, gone })
  }
  await ensureAnswerKeyIndexes(db)
  const report: string[] = []
  for (const { name, col, docs, ops, gone } of plans) {
    if (ops.length) await col.bulkWrite(ops, { ordered: false })
    if (gone.length) await col.deleteMany({ _id: { $in: gone } })
    report.push(`${name}: ${docs.length} items, ${ops.length} written, ${docs.length - ops.length} unchanged, ${gone.length} removed`)
  }
  return report
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { MONGODB_URI, MONGODB_DB = 'qa_learn' } = process.env
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set: copy .env.example to .env and fill it in')
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true })
  await client.connect()
  try {
    const report = await syncAnswerKeys(client.db(MONGODB_DB), await buildAnswerKey(), { allowDelete: process.argv.includes('--allow-delete') })
    console.log(report.join('\n'))
  } finally {
    await client.close()
  }
}
