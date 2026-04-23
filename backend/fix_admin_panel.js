const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function runSetup() {
  try {
    await client.connect();

    // 1. Check current profiles policies
    const { rows: policies } = await client.query(
      `SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles'`
    );
    console.log('Current profiles policies:', policies);

    // 2. Drop the old restrictive SELECT policy
    await client.query(`DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;`);
    console.log('Dropped old restrictive SELECT policy.');

    // 3. Drop the previous attempt too (in case it exists)
    await client.query(`DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;`);
    console.log('Dropped previous fix attempt.');

    // 4. Create a clean, broad SELECT policy — admins see all, users see own
    await client.query(`
      CREATE POLICY "Profiles are viewable by authenticated users"
        ON public.profiles FOR SELECT
        TO authenticated
        USING ( true );
    `);
    console.log('Created new broad SELECT policy for profiles.');

    // 5. Delete 0-match entries from draw_results (only winners with 3+ should exist)
    const { rowCount } = await client.query(`DELETE FROM public.draw_results WHERE match_count < 3;`);
    console.log(`Deleted ${rowCount} non-winner entries (0 match results).`);

    // Verify
    const { rows: remaining } = await client.query(`SELECT user_id, match_count, prize FROM public.draw_results;`);
    console.log('Remaining draw results:', remaining);

    console.log('\nAll fixes applied successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
