import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const claveSecreta = process.env.SUPABASE_SECRET_KEY || 'placeholder';

export const supabase = createClient(url, claveSecreta);
