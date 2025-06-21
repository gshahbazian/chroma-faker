import type { Collection } from 'chromadb'
import { createClient } from './client'

const path = 'result.json'
const file = Bun.file(path)

const contents = await file.json()

// PASTE CHROME CONNECT STRING HERE

const client = createClient({
  apiKey: 'YOUR_API_KEY',
  tenant: 'YOUR_TENANT_NAME',
  database: 'YOUR_DATABASE_NAME',
})

// END PASTE

const NEW_COLLECTION_NAME = 'uploaded'
const RECORD_BATCH_SIZE = 20

async function insertBatch(collection: Collection, batchNumber: number) {
  const previouslyInsertedRecords = batchNumber * RECORD_BATCH_SIZE

  const documents = contents.documents.slice(
    previouslyInsertedRecords,
    previouslyInsertedRecords + RECORD_BATCH_SIZE,
  )
  const metadatas = contents.metadatas.slice(
    previouslyInsertedRecords,
    previouslyInsertedRecords + RECORD_BATCH_SIZE,
  )
  const ids = contents.ids.slice(
    previouslyInsertedRecords,
    previouslyInsertedRecords + RECORD_BATCH_SIZE,
  )
  const embeddings = contents.embeddings.slice(
    previouslyInsertedRecords,
    previouslyInsertedRecords + RECORD_BATCH_SIZE,
  )

  await collection.add({
    documents,
    metadatas,
    ids,
    embeddings,
  })

  console.log(
    `Added ${documents.length} documents to the collection ${collection.name}`,
  )
}

const collection = await client.getOrCreateCollection({
  name: NEW_COLLECTION_NAME,
})

const batchCount = Math.ceil(contents.documents.length / RECORD_BATCH_SIZE)
for (let i = 0; i < batchCount; i++) {
  await insertBatch(collection, i)
}
