import { ChromaClient } from 'chromadb'

const host = 'localhost' // 'api.trychroma.com'

export function createClient({
  apiKey,
  tenant,
  database,
}: {
  apiKey: string
  tenant: string
  database: string
}) {
  return new ChromaClient({
    host,
    port: 8000,
    ssl: host !== 'localhost',
    headers: { 'x-chroma-token': apiKey },
    tenant,
    database,
  })
}
