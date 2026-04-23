const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.hxpyywanwuehqdvtjpff:mDdVbSOztXNWfEF7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

async function runSetup() {
  try {
    await client.connect();
    console.log('Connected to Supabase.');

    // Note: The artifact path in Windows is tricky, but we wrote it to the brain folder.
    // However, I can just hardcode the SQL here to ensure it runs correctly instead of reading the file.
    const sql = `
      CREATE TABLE IF NOT EXISTS public.charities (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        description text,
        image_url text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      DO $$
      BEGIN
          BEGIN
              ALTER TABLE public.profiles DROP COLUMN IF EXISTS "isSubscribed";
          EXCEPTION WHEN undefined_column THEN
          END;
          
          BEGIN
              ALTER TABLE public.profiles DROP COLUMN IF EXISTS "charityPercentage";
          EXCEPTION WHEN undefined_column THEN
          END;
      END $$;

      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS is_subscribed boolean default false,
      ADD COLUMN IF NOT EXISTS subscription_type text check (subscription_type in ('monthly', 'yearly')),
      ADD COLUMN IF NOT EXISTS charity_id uuid references public.charities(id),
      ADD COLUMN IF NOT EXISTS charity_percentage int default 10;

      CREATE TABLE IF NOT EXISTS public.subscriptions (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        type text check (type in ('monthly', 'yearly')),
        status text check (status in ('active', 'inactive')),
        start_date timestamp with time zone default timezone('utc'::text, now()),
        end_date timestamp with time zone
      );

      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

      ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Charities are viewable by everyone." ON public.charities;
      CREATE POLICY "Charities are viewable by everyone."
        ON public.charities FOR SELECT
        USING ( true );

      DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
      DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
      CREATE POLICY "Users can view own profile."
        ON public.profiles FOR SELECT
        USING ( auth.uid() = id );

      DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
      CREATE POLICY "Users can update own profile."
        ON public.profiles FOR UPDATE
        USING ( auth.uid() = id );

      DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
      CREATE POLICY "Users can insert their own profile."
        ON public.profiles FOR INSERT
        WITH CHECK ( auth.uid() = id );

      DROP POLICY IF EXISTS "Users can view own subscriptions." ON public.subscriptions;
      CREATE POLICY "Users can view own subscriptions."
        ON public.subscriptions FOR SELECT
        USING ( auth.uid() = user_id );

      DROP POLICY IF EXISTS "Users can insert own subscriptions." ON public.subscriptions;
      CREATE POLICY "Users can insert own subscriptions."
        ON public.subscriptions FOR INSERT
        WITH CHECK ( auth.uid() = user_id );

      DROP POLICY IF EXISTS "Users can update own subscriptions." ON public.subscriptions;
      CREATE POLICY "Users can update own subscriptions."
        ON public.subscriptions FOR UPDATE
        USING ( auth.uid() = user_id );

      INSERT INTO public.charities (name, description, image_url)
      VALUES 
        ('Global Education Fund', 'Providing education resources to underprivileged children worldwide.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80'),
        ('Ocean Cleanup Initiative', 'Dedicated to removing plastic waste from our oceans and beaches.', 'https://images.unsplash.com/photo-1621451537084-482c73073e0f?w=500&q=80'),
        ('Wildlife Rescue', 'Protecting endangered species and preserving natural habitats.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&q=80')
      ON CONFLICT DO NOTHING;
    `;

    await client.query(sql);
    console.log('Database setup executed successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

runSetup();
