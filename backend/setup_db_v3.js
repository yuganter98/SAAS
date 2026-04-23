const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hxpyywanwuehqdvtjpff:mDdVbSOztXNWfEF7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();
    console.log('Connected to Supabase.');

    const sql = `
      -- 1. Scores Table
      CREATE TABLE IF NOT EXISTS public.scores (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        score int check (score >= 1 and score <= 45) not null,
        played_at date not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        UNIQUE(user_id, played_at)
      );

      -- Index for better performance
      CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_scores_played_at ON public.scores(played_at);

      -- 2. Enable Row Level Security (RLS)
      ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

      -- 3. Create RLS Policies
      DROP POLICY IF EXISTS "Users can view own scores." ON public.scores;
      CREATE POLICY "Users can view own scores."
        ON public.scores FOR SELECT
        USING ( auth.uid() = user_id );

      DROP POLICY IF EXISTS "Users can insert own scores." ON public.scores;
      CREATE POLICY "Users can insert own scores."
        ON public.scores FOR INSERT
        WITH CHECK ( auth.uid() = user_id );

      DROP POLICY IF EXISTS "Users can update own scores." ON public.scores;
      CREATE POLICY "Users can update own scores."
        ON public.scores FOR UPDATE
        USING ( auth.uid() = user_id )
        WITH CHECK ( auth.uid() = user_id );

      DROP POLICY IF EXISTS "Users can delete own scores." ON public.scores;
      CREATE POLICY "Users can delete own scores."
        ON public.scores FOR DELETE
        USING ( auth.uid() = user_id );
    `;

    await client.query(sql);
    console.log('Database scores setup executed successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
