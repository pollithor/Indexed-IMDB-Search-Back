import { MeiliSearch } from 'meilisearch'
import csv from 'csvtojson'
import path from 'path'

const client = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY || 'masterkey',
})

const INDEX_NAME = 'movies'
const CSV_PATH = path.join(__dirname, '../data/movies.csv')
console.log(CSV_PATH)

interface Movie {
    id: string | number
    title: string
    year: number
}

export async function loadData() {
    try {
        const index = await client.index<Movie>(INDEX_NAME)
        let count = 0

        try {
            const stats = await index.getStats()
            count = stats.numberOfDocuments
        } catch {
            // índice no existe
        }

        if (count > 0) {
            console.log(`El índice "${INDEX_NAME}" ya tiene ${count} documentos.`)
            return
        }

        console.log('Cargando datos desde CSV...')

        const records: Movie[] = await csv().fromFile(CSV_PATH)
        console.log('Registros CSV parseados:', records.length)

        const newIndex = await client.getIndex(INDEX_NAME).catch(async () => {
            await client.createIndex(INDEX_NAME, { primaryKey: 'id' })
            return client.index<Movie>(INDEX_NAME)
        })

        const task = await newIndex.addDocuments(records)
        console.log('Documentos cargados. Task:', task.taskUid)

    } catch (err) {
        console.error('Error al cargar CSV en Meilisearch:', err)
    }
}