const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseAnonKey = '';

envLocal.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = val;
    } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      supabaseAnonKey = val;
    }
  }
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .ilike('question_text', '%perimeter%');

    if (error) throw error;

    console.log(`\nFound ${data.length} matches in database:\n`);
    data.forEach((q, idx) => {
      console.log(`Match #${idx + 1}:`);
      console.log(`Source File: ${q.source_file}`);
      console.log(`Q#${q.question_number}`);
      console.log(`Text: ${q.question_text}`);
      console.log('------------------------');
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
