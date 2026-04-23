const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hxpyywanwuehqdvtjpff:mDdVbSOztXNWfEF7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString });

async function runSetup() {
  try {
    await client.connect();

    // Replace the UPDATE policy: users can update own, admins can update any
    await client.query(`
      DROP POLICY IF EXISTS "Users can update own results" ON public.draw_results;
      CREATE POLICY "Users and admins can update results"
        ON public.draw_results FOR UPDATE
        USING (
          auth.uid() = user_id
          OR
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `);
    
    console.log('Fixed draw_results UPDATE policy for admins.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
