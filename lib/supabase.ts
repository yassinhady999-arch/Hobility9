
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://davdkdedhtqauyeecwgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmRrZGVkaHRxYXV5ZWVjd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzkxNDIsImV4cCI6MjA3OTgxNTE0Mn0.020js1gVypBOYd25mtKRlerr63p2JH9QKNL_NG-LMzs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
