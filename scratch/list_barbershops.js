const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!url || !key) {
  console.error('Missing Supabase URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function listBarbershops() {
  const { data, error } = await supabase.from('barbershops').select('id, name, slug');
  if (error) {
    console.error('Error fetching barbershops:', error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

listBarbershops();
