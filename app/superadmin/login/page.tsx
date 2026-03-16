'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SuperadminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Standard redirection after success, middleware will handle the actual protection checks
      router.push('/superadmin')
      router.refresh()
    } catch (err: any) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-2xl font-black text-gray-900 group">
          <ShieldCheck className="h-8 w-8 text-trust-blue-600" />
          Book<span className="text-trust-blue-600 transition-colors group-hover:text-trust-blue-500">Admin</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-trust-blue-500 focus:outline-none focus:ring-trust-blue-500 sm:text-sm"
                  placeholder="Admin email address"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-trust-blue-500 focus:outline-none focus:ring-trust-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-trust-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-trust-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trust-blue-600 transition-colors h-11"
              >
                {loading ? 'Signing in...' : 'Sign in to Admin Dashboard'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
