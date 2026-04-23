const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();
    
    // 1. Add policy so Admins can read all scores (bypassing the user-only RLS)
    await client.query(`
      DROP POLICY IF EXISTS "Admins can view all scores." ON public.scores;
      CREATE POLICY "Admins can view all scores."
        ON public.scores FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `);
    
    // 2. Delete the stuck draw so it can be re-run
    await client.query(`DELETE FROM public.draws;`);
    
    console.log('Fixed RLS and reset draws successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
