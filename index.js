#!/usr/bin/env node

import { ChromaClient } from 'chromadb'
import { faker } from '@faker-js/faker'

const RECORDS_TO_GENERATE = 340

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

async function generateAndLoadData() {
  try {
    const collection = await client.getOrCreateCollection({
      name: 'faker',
      metadata: { description: 'Sample collection with faker generated data' },
    })

    const documents = []
    const metadatas = []
    const ids = []

    for (let i = 0; i < RECORDS_TO_GENERATE; i++) {
      const document = faker.lorem.paragraphs(3)

      const metadata = {
        author: faker.person.fullName(),
        created_date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
        category: faker.helpers.arrayElement([
          'tech',
          'science',
          'business',
          'health',
        ]),
        word_count: document.split(' ').length,
        language: 'en',
        priority_score: Number(
          faker.number.float({ min: 0, max: 10, precision: 0.01 }).toFixed(2),
        ),
        is_reviewed: faker.datatype.boolean(),
        department: faker.commerce.department(),
        location: faker.location.city(),
        country_code: faker.location.countryCode(),
        source_url: faker.internet.url(),
        reading_time_minutes: faker.number.int({ min: 3, max: 15 }),
      }

      documents.push(document)
      metadatas.push(metadata)
      ids.push(`doc_${i}`)
    }

    await collection.add({
      documents,
      metadatas,
      ids,
    })

    console.log(`Added ${documents.length} documents to the collection`)

    const result = await collection.get({
      ids: [ids[0]],
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

generateAndLoadData()
