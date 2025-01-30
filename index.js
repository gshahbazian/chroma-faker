#!/usr/bin/env node

import { ChromaClient } from 'chromadb'
import { faker } from '@faker-js/faker'

const COLLECTIONS_TO_GENERATE = 7
const RECORDS_TO_GENERATE = 15

// PASTE CHROME CONNECT STRING HERE

const client = new ChromaClient({
  path: 'http://localhost:8000',
  auth: {
    provider: 'token',
    credentials: 'YOUR_API_KEY',
    tokenHeaderType: 'X_CHROMA_TOKEN',
  },
  tenant: 'tenantuuid',
  database: 'databaseslug',
})

// END PASTE

const RECORD_BATCH_SIZE = 20

async function generateAndLoadData(colNumber) {
  try {
    console.log('\n\n')
    console.log('=========')

    const name = `col_${colNumber}`
    console.log(`Generating collection: ${name}`)

    const collection = await client.getOrCreateCollection({
      name,
    })

    const batchCount = Math.ceil(RECORDS_TO_GENERATE / RECORD_BATCH_SIZE)
    for (let i = 0; i < batchCount; i++) {
      await insertBatch(collection, i)
    }

    const result = await collection.get({
      ids: ['doc_1'],
    })

    console.log('\n\n')
    console.log('Sample document with metadata:')
    console.log('Document ID:', result.ids[0])
    console.log('Metadata:', result.metadatas[0])
    console.log(
      'First 200 chars of document:',
      result.documents[0].substring(0, 200),
    )

    // Example query
    const queryResults = await collection.query({
      queryTexts: ['technology'],
      nResults: 2,
    })

    console.log('\n\n')
    console.log('Sample query results:')
    console.log(`Found ${queryResults.ids[0].length} matching documents`)
  } catch (error) {
    console.error('Error:', error)
  }
}

async function insertBatch(collection, batchNumber) {
  const documents = []
  const metadatas = []
  const ids = []

  const previouslyInsertedRecords = batchNumber * RECORD_BATCH_SIZE
  const recordsToGenerate = Math.min(
    RECORDS_TO_GENERATE - previouslyInsertedRecords,
    RECORD_BATCH_SIZE,
  )

  for (let i = 0; i < recordsToGenerate; i++) {
    const document = faker.lorem.paragraphs(1)

    const metadata = {
      author: faker.person.fullName(),
      created_date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      category: faker.helpers.arrayElement([
        'tech',
        'science',
        'business',
        'health',
      ]),
    }

    documents.push(document)
    metadatas.push(metadata)
    ids.push(`doc_${i + previouslyInsertedRecords + 1}`)
  }

  await collection.add({
    documents,
    metadatas,
    ids,
  })

  console.log(
    `Added ${documents.length} documents to the collection ${collection.name}`,
  )
}

for (let i = 1; i <= COLLECTIONS_TO_GENERATE; i++) {
  await generateAndLoadData(i)
}
