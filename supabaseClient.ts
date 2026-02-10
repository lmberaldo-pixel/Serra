
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zgflchxpiicfjtkvuzsd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_J7yzI-0y9pcIGT2tT_rrkA_L9gvosWV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
