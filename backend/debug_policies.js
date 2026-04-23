const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();

    // Check ALL current policies on profiles
    const { rows: policies } = await client.query(
      `SELECT policyname, cmd, qual, with_check, roles 
       FROM pg_policies WHERE tablename = 'profiles'`
    );
    console.log('ALL profiles policies:');
    policies.forEach(p => console.log(`  ${p.policyname} | cmd=${p.cmd} | roles=${p.roles} | qual=${p.qual}`));

    // Check if RLS is enabled
    const { rows: rls } = await client.query(
      `SELECT relname, relrowsecurity, relforcerowsecurity 
       FROM pg_class WHERE relname = 'profiles'`
    );
    console.log('\nRLS status:', rls);

    // Check draw_results policies
    const { rows: drPolicies } = await client.query(
      `SELECT policyname, cmd, qual, roles 
       FROM pg_policies WHERE tablename = 'draw_results'`
    );
    console.log('\nALL draw_results policies:');
    drPolicies.forEach(p => console.log(`  ${p.policyname} | cmd=${p.cmd} | roles=${p.roles} | qual=${p.qual}`));

    // Verify data exists
    const { rows: profiles } = await client.query(`SELECT id, name FROM public.profiles LIMIT 5`);
    console.log('\nProfiles in DB:', profiles);

    const { rows: results } = await client.query(`SELECT id, user_id, match_count FROM public.draw_results`);
    console.log('\nDraw results in DB:', results);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
