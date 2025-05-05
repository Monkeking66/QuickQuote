import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { join } from 'path';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const applySchema = async () => {
  try {
    console.log('Reading SQL file...');
    const sqlFilePath = join(process.cwd(), 'scripts', 'database-setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    // This is a simple approach - for complex SQL you might need a proper SQL parser
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Execute statement using Supabase's SQL query method
      const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
    }
    
    console.log('Database schema applied successfully!');
  } catch (error) {
    console.error('Error applying database schema:', error);
    process.exit(1);
  }
};

applySchema();
