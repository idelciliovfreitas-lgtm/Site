import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdpanedlydzttnhiltvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGFuZWRseWR6dHRuaGlsdHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDI4MTIsImV4cCI6MjA5NDE3ODgxMn0.kuOL4yk9w6avRBNoMEFT-1OFqGbZgYatVTD2fUllO1Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
