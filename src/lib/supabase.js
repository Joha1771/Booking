import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ubcptukukovnymesuzro.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_7sDVHEGWHe_Uo35_u389fQ_0nuWRaaU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
