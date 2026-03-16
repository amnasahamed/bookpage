import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in Client Components.
 * 
 * This uses a singleton pattern — calling createClient() multiple times
 * returns the same instance, which is the recommended approach from Supabase.
 * 
 * Note: We intentionally omit the Database generic here because the 
 * hand-written database.types.ts may not perfectly match the format expected
 * by the Supabase client. For full type safety, use `supabase gen types` 
 * to generate types from your Supabase project, then add the generic back:
 *   createBrowserClient<Database>(...)
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
