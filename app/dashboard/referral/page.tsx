'use client'

import { useState, useEffect } from 'react'
import {
  Gift,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Share2,
  Users,
  IndianRupee,
  Calendar,
  Clock
} from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'

export default function ReferralPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [creditsEarned, setCreditsEarned] = useState(0)
  const [referralList, setReferralList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchReferralData = async () => {
      setIsLoading(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, credits_earned')
        .eq('id', user.id)
        .single()

      if (profile) {
        setReferralCode(profile.referral_code || '')
        setCreditsEarned(profile.credits_earned || 0)
      }

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

      if (referrals) setReferralList(referrals)
      setIsLoading(false)
    }
    fetchReferralData()
  }, [user, supabase])

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/signup?ref=${referralCode}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      addToast({ title: 'Copied to clipboard!', variant: 'success' })
    } catch {
      addToast({ title: 'Copy failed', description: 'Please copy the link manually', variant: 'destructive' })
    }
  }

  const shareVia = (url: string) => {
    const popup = window.open(url, '_blank', 'noopener,noreferrer')
    if (!popup) {
      addToast({ title: 'Popup blocked', description: 'Please allow popups to share, or copy the link manually', variant: 'destructive' })
    }
  }

  const shareOnWhatsApp = () => {
    const message = `Hey! I'm using BookPage for my property bookings. Use my referral code ${referralCode} to get ₹666 credit when you sign up! ${referralLink}`
    const encodedMessage = encodeURIComponent(message)
    shareVia(`https://wa.me/?text=${encodedMessage}`)
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Get ₹666 off on BookPage - Property Booking Platform')
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share BookPage with you - it's a great platform for property owners to create beautiful booking pages.\n\nUse my referral code: ${referralCode}\n\nSign up here: ${referralLink}\n\nYou'll get ₹666 credit and so will I!\n\nCheers!`
    )
    shareVia(`mailto:?subject=${subject}&body=${body}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar propertyName="Moonlight Villa" verificationStatus="approved" />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Refer & Earn</h1>
            <p className="text-gray-500 mt-1">
              Earn ₹666 for every property owner you refer
            </p>
          </div>

          {/* Referral Code Card */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-trust-blue-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-8 w-8" />
                <span className="text-lg font-medium">Your Referral Code</span>
              </div>

              <div className="text-4xl md:text-5xl font-bold tracking-wider mb-6 font-mono">
                {referralCode}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(referralCode)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={shareOnWhatsApp}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(referralLink)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="secondary"
                  onClick={shareViaEmail}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-trust-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-trust-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{referralList.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-success-green-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-success-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credits Earned</p>
                    <p className="text-2xl font-bold text-gray-900">₹{creditsEarned.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-trust-blue-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-trust-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Credits</p>
                    <p className="text-2xl font-bold text-trust-blue-600">₹{creditsEarned.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-warning-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-warning-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Renewal</p>
                    <p className="text-lg font-bold text-gray-900">₹666 off</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Simple steps to earn credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-trust-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Share Your Code</h3>
                  <p className="text-sm text-gray-500">
                    Share your unique referral code with other property owners
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-success-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. They Sign Up</h3>
                  <p className="text-sm text-gray-500">
                    When they create an account using your code, you both benefit
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IndianRupee className="h-8 w-8 text-trust-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Both Get ₹666</h3>
                  <p className="text-sm text-gray-500">
                    That&apos;s 2 months free! Credits apply to your subscription
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referred Owners List */}
          <Card>
            <CardHeader>
              <CardTitle>Referred Property Owners</CardTitle>
              <CardDescription>Track your referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {referralList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No referrals yet. Start sharing your code!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Signup Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralList.map((owner) => (
                        <tr key={owner.id} className="border-b border-gray-100 last:border-0">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{owner.name || owner.referred_user_name || owner.id}</span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(owner.signupDate || owner.created_at)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={owner.status === 'awarded' ? 'success' : 'hold'}
                              className="capitalize"
                            >
                              {owner.status === 'awarded' ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Awarded
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={cn(
                              'font-medium',
                              owner.status === 'awarded' ? 'text-success-green-600' : 'text-gray-400'
                            )}>
                              ₹{owner.creditAmount || owner.credit_amount || 666}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
