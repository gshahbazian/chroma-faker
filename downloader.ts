import { createClient } from './client'

// PASTE CHROME CONNECT STRING HERE

const client = createClient({
  apiKey: 'YOUR_API_KEY',
  tenant: 'YOUR_TENANT_NAME',
  database: 'YOUR_DATABASE_NAME',
})

// END PASTE

const COLLECTION_NAME = 'uploaded'

const collection = await client.getCollection({
  name: COLLECTION_NAME,
  embeddingFunction: {
    generate: async (texts: string[]) => {
      return texts.map(() => new Array(1536).fill(0))
    },
  },
})

const result = await collection.get({
  limit: 150,
  include: ['documents', 'metadatas', 'embeddings'],
})

const jsonString = JSON.stringify(result)
await Bun.write('result.json', jsonString)
