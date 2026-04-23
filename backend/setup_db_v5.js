const { Client } = require('pg');

require('dotenv').config(); const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();
    console.log('Connected to Supabase.');

    const sql = `
      -- 1. Modify draw_results Table
      ALTER TABLE public.draw_results 
      ADD COLUMN IF NOT EXISTS status text check (status in ('pending', 'verified', 'rejected', 'paid')) default 'pending',
      ADD COLUMN IF NOT EXISTS proof_url text;

      -- 2. Add Performance Index
      CREATE INDEX IF NOT EXISTS idx_draw_results_user_id ON public.draw_results(user_id);

      -- 3. Create Storage Bucket for Proofs
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('proofs', 'proofs', false) 
      ON CONFLICT (id) DO NOTHING;

      -- 4. Enable RLS on storage.objects
      -- Removed because Supabase already manages this and postgres user cannot alter it.

      -- 5. Storage RLS Policies
      DROP POLICY IF EXISTS "Users can upload their own proofs." ON storage.objects;
      CREATE POLICY "Users can upload their own proofs."
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'proofs' 
          AND auth.uid() = owner
        );

      DROP POLICY IF EXISTS "Users can view their own proofs." ON storage.objects;
      CREATE POLICY "Users can view their own proofs."
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'proofs' 
          AND auth.uid() = owner
        );

      DROP POLICY IF EXISTS "Admins can view all proofs." ON storage.objects;
      CREATE POLICY "Admins can view all proofs."
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'proofs' 
          AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `;

    await client.query(sql);
    console.log('Database Admin Panel and Storage setup executed successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
