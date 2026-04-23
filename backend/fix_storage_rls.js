const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();

    // 1. Check if proofs bucket exists, create if not
    const { rows: buckets } = await client.query(
      `SELECT id FROM storage.buckets WHERE id = 'proofs'`
    );
    
    if (buckets.length === 0) {
      await client.query(`
        INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', false);
      `);
      console.log('Created proofs bucket.');
    } else {
      console.log('Proofs bucket already exists.');
    }

    // 2. Drop all existing storage policies for proofs bucket to start clean
    const { rows: existingPolicies } = await client.query(`
      SELECT policyname FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname LIKE '%proofs%'
    `);
    
    for (const p of existingPolicies) {
      await client.query(`DROP POLICY IF EXISTS "${p.policyname}" ON storage.objects;`);
      console.log(`Dropped old policy: ${p.policyname}`);
    }

    // 3. Users can upload to their own folder in proofs bucket
    await client.query(`
      CREATE POLICY "Users can upload own proofs"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'proofs' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    `);
    console.log('Created INSERT policy for proofs.');

    // 4. Users can view their own proofs
    await client.query(`
      CREATE POLICY "Users can view own proofs"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'proofs' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    `);
    console.log('Created SELECT policy (user) for proofs.');

    // 5. Users can update/overwrite their own proofs
    await client.query(`
      CREATE POLICY "Users can update own proofs"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'proofs' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    `);
    console.log('Created UPDATE policy for proofs.');

    // 6. Admins can view all proofs (for the admin panel)
    await client.query(`
      CREATE POLICY "Admins can view all proofs"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'proofs' 
          AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `);
    console.log('Created SELECT policy (admin) for proofs.');

    console.log('\nAll storage policies fixed successfully!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
