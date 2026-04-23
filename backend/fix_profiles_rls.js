const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();
    
    // Add policy so everyone (including admins) can read all profiles
    await client.query(`
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
      CREATE POLICY "Public profiles are viewable by everyone."
        ON public.profiles FOR SELECT
        USING ( true );
    `);
    
    console.log('Fixed Profiles RLS successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
