
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!connectionString) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function run() {
  try {
    console.log('Connecting to database...')
    const client = await pool.connect()
    try {
      console.log('Creating extension unaccent...')
      await client.query('CREATE EXTENSION IF NOT EXISTS unaccent;')
      console.log('Success!')
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Error executing query', err)
  } finally {
    await pool.end()
  }
}

run()
