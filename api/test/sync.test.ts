// The answer-key sync (M1) against a real mongod, in a throwaway database that is dropped afterwards.
// Skipped unless TEST_MONGODB_URI is set: TEST_MONGODB_URI=mongodb://127.0.0.1:27017 npm test
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { MongoClient, type Db } from 'mongodb'
import { buildAnswerKey } from '../../scripts/content-split.ts'
import { syncAnswerKeys, type AnswerSets } from '../src/sync-answer-keys.ts'

const uri = process.env.TEST_MONGODB_URI
const skip = !uri && 'set TEST_MONGODB_URI to run against a local mongod'
let client: MongoClient
let db: Db

before(async () => {
  if (skip) return
  client = new MongoClient(uri!, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true })
  await client.connect()
  db = client.db(`qa_learn_test_${process.pid}_${Date.now()}`)
})
after(async () => {
  if (skip) return
  await db.dropDatabase()
  await client.close()
})

const real = await buildAnswerKey()
const clone = (): AnswerSets => structuredClone(real)
const count = (name: string) => db.collection(name).countDocuments()

test('the real content: every MCQ, interview, lab and drill, coding solution and company answer is stored', { skip }, async () => {
  const report = await syncAnswerKeys(db, clone())
  assert.match(report[0], /answer_keys: \d+ items, \d+ written, 0 unchanged/)
  for (const [name, docs] of Object.entries(real)) assert.equal(await count(name), docs.length, name)
  const mcq = await db.collection('answer_keys').findOne({ kind: 'mcq' })
  assert.ok(Array.isArray(mcq?.correct) && typeof mcq?.explanation === 'string' && mcq?.topicId)
  const coding = await db.collection('coding_solutions').findOne({})
  assert.ok(typeof coding?.solution === 'string')
  const company = await db.collection('company_questions').findOne({})
  assert.ok(typeof company?.answer === 'string')
})

test('a second sync writes nothing; an edited answer is the only write', { skip }, async () => {
  await syncAnswerKeys(db, clone())
  assert.match((await syncAnswerKeys(db, clone()))[0], / 0 written, \d+ unchanged, 0 removed/)
  const edited = clone()
  edited.answer_keys[0] = { ...edited.answer_keys[0], explanation: 'changed', contentHash: 'changed-hash' }
  const report = await syncAnswerKeys(db, edited)
  assert.match(report[0], / 1 written, /)
  assert.equal((await db.collection('answer_keys').findOne({ _id: edited.answer_keys[0]._id as never }))?.explanation, 'changed')
})

test('removed content is deleted, but a mass delete is refused unless allowed', { skip }, async () => {
  await syncAnswerKeys(db, clone())
  const fewer = clone()
  fewer.coding_solutions.pop()
  assert.match((await syncAnswerKeys(db, fewer))[1], / 1 removed/)

  // a broken content load: nothing at all is written, in any collection
  const broken = clone()
  broken.company_questions = []
  const before = await count('answer_keys')
  await assert.rejects(syncAnswerKeys(db, { ...broken, answer_keys: broken.answer_keys.slice(1) }), /company_questions: refusing to delete/)
  assert.equal(await count('answer_keys'), before, 'checks run before any write')
  assert.equal(await count('company_questions'), real.company_questions.length)

  await syncAnswerKeys(db, broken, { allowDelete: true })
  assert.equal(await count('company_questions'), 0)
})
