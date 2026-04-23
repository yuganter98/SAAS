const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hxpyywanwuehqdvtjpff:mDdVbSOztXNWfEF7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid references auth.users on delete cascade not null primary key,
        name text,
        "isSubscribed" boolean default false,
        "charityPercentage" integer default 10
      );
    `;
    await client.query(createTableQuery);
    console.log('Profiles table created or already exists.');

    const enableRlsQuery = `
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    `;
    await client.query(enableRlsQuery);
    console.log('Row Level Security enabled on profiles table.');

    const policiesQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone.'
          ) THEN
              CREATE POLICY "Public profiles are viewable by everyone."
                ON public.profiles FOR SELECT
                USING ( true );
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile.'
          ) THEN
              CREATE POLICY "Users can insert their own profile."
                ON public.profiles FOR INSERT
                WITH CHECK ( auth.uid() = id );
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile.'
          ) THEN
              CREATE POLICY "Users can update own profile."
                ON public.profiles FOR UPDATE
                USING ( auth.uid() = id );
          END IF;
      END
      $$;
    `;
    await client.query(policiesQuery);
    console.log('RLS policies created.');

  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
    console.log('Disconnected from database.');
  }
}

setupDatabase();
