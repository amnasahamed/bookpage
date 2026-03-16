import { 
  Users, 
  Home, 
  ShieldCheck, 
  TrendingUp 
} from 'lucide-react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// We make this page dynamically rendered so it always fetches fresh stats
export const dynamic = 'force-dynamic'

export default async function SuperadminDashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Verify superadmin status server-side
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : []
  const isAdmin = user?.email && adminEmails.includes(user.email)

  if (!isAdmin) {
    redirect('/superadmin/login')
  }

  // Fetch basic stats
  const results = await Promise.allSettled([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('properties')
      .select('id, name, owner_id, created_at, profiles!inner(full_name, email)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const totalProperties = results[0].status === 'fulfilled' ? (results[0].value.count ?? 0) : 0
  const activeOwners = results[1].status === 'fulfilled' ? (results[1].value.count ?? 0) : 0
  const pendingVerifications = results[2].status === 'fulfilled' ? (results[2].value.count ?? 0) : 0
  const totalBookings = results[3].status === 'fulfilled' ? (results[3].value.count ?? 0) : 0
  const recentVerifications = results[4].status === 'fulfilled' ? (results[4].value.data ?? []) : []

  const stats = [
    { name: 'Total Properties', value: totalProperties || 0, change: '+12%', icon: Home },
    { name: 'Active Owners', value: activeOwners || 0, change: '+8%', icon: Users },
    { name: 'Pending Verifications', value: pendingVerifications || 0, change: '-2%', icon: ShieldCheck },
    { name: 'Bookings', value: totalBookings || 0, change: '+24%', icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">System Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:border-trust-blue-100 hover:shadow-md transition-all">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="flex items-center text-sm font-medium mt-2 text-success-green-600">
                {stat.change} <span className="text-gray-400 ml-1">last 30 days</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-trust-blue-600 group-hover:bg-trust-blue-50 transition-colors">
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Required: Verifications */}
      <div className="mb-10 lg:w-3/4">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Action Required <span className="bg-warning-amber-100 text-warning-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{pendingVerifications || 0}</span>
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentVerifications && recentVerifications.length > 0 ? (
                recentVerifications.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{item.id.split('-')[0]}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <p>{item.profiles?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-400 font-normal">{item.profiles?.email}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-trust-blue-600 hover:text-trust-blue-700 font-semibold transition-colors bg-trust-blue-50 hover:bg-trust-blue-100 px-4 py-2 rounded-lg">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-gray-500">
                    No pending verifications to review right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
            <button className="text-sm font-semibold text-trust-blue-600 hover:text-trust-blue-700">
              View All Pending Verifications →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
