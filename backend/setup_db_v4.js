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
      -- 1. Alter Profiles to add Role
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS role text default 'user';

      -- 2. Draws Table
      CREATE TABLE IF NOT EXISTS public.draws (
        id uuid default gen_random_uuid() primary key,
        month text unique not null,
        numbers int[] not null,
        status text check (status in ('pending', 'completed')) default 'completed',
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- 3. Draw Results Table
      CREATE TABLE IF NOT EXISTS public.draw_results (
        id uuid default gen_random_uuid() primary key,
        draw_id uuid references public.draws(id) on delete cascade not null,
        user_id uuid references auth.users(id) on delete cascade not null,
        match_count int not null,
        prize numeric default 0,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        UNIQUE(draw_id, user_id)
      );

      -- 4. Enable Row Level Security (RLS)
      ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;

      -- 5. Create RLS Policies
      DROP POLICY IF EXISTS "Draws are viewable by everyone." ON public.draws;
      CREATE POLICY "Draws are viewable by everyone."
        ON public.draws FOR SELECT
        USING ( true );

      DROP POLICY IF EXISTS "Users can view own draw results." ON public.draw_results;
      CREATE POLICY "Users can view own draw results."
        ON public.draw_results FOR SELECT
        USING ( 
          auth.uid() = user_id OR 
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );

      DROP POLICY IF EXISTS "Admins can insert draws." ON public.draws;
      CREATE POLICY "Admins can insert draws."
        ON public.draws FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );

      DROP POLICY IF EXISTS "Admins can update draws." ON public.draws;
      CREATE POLICY "Admins can update draws."
        ON public.draws FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );

      DROP POLICY IF EXISTS "Admins can insert draw results." ON public.draw_results;
      CREATE POLICY "Admins can insert draw results."
        ON public.draw_results FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    `;

    await client.query(sql);
    console.log('Database monthly draw setup executed successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
