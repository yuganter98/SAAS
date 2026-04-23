const { Client } = require('pg');
const client = new Client('postgresql://postgres.hxpyywanwuehqdvtjpff:mDdVbSOztXNWfEF7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres');

async function run() {
  await client.connect();

  // 1. Fix the Ocean Cleanup image
  await client.query(
    `UPDATE public.charities SET image_url = 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=500&q=80' WHERE name = 'Ocean Cleanup Initiative'`
  );
  console.log('Fixed Ocean Cleanup image.');

  // 2. Reset draws for re-testing
  await client.query(`DELETE FROM public.draw_results;`);
  await client.query(`DELETE FROM public.draws;`);
  console.log('Reset all draws and results.');

  await client.end();
}

run().catch(e => { console.error(e); client.end(); });
