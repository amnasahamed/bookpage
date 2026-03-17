import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore — middleware will refresh session
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // After email confirmation, create the property if it doesn't exist yet
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const meta = user.user_metadata as { property_name?: string; property_slug?: string }
        const propertyName = meta?.property_name
        const propertySlug = meta?.property_slug

        if (propertyName && propertySlug) {
          // Check if property already exists (e.g. created during signup when email confirmation is off)
          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('owner_id', user.id)
            .single()

          if (!existing) {
            await supabase.from('properties').insert({
              owner_id: user.id,
              name: propertyName,
              slug: propertySlug,
              subscription_status: 'trial',
              is_verified: false,
              verification_status: 'pending',
              is_hibernating: false,
            })
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
