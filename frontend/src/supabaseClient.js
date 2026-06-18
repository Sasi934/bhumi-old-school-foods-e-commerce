import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://uyfyzngkbogtieowfhkx.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Znl6bmdrYm9ndGllb3dmaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTcxNTYsImV4cCI6MjA5Mzg5MzE1Nn0.UtHwYckqb3iULvCiyiL5yoBMriyi529pdjBiIdNEJSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
