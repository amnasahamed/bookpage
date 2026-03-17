'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/providers'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    let rafId: number
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10)
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-500 ease-out',
        isScrolled
          ? 'top-4 mx-4 md:mx-8 bg-white/80 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl h-[64px]'
          : 'top-0 bg-transparent h-[80px]'
      )}
    >
      <div className="container-xl h-full px-6">
        <nav className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-gray-900 group"
          >
            Book<span className="text-trust-blue-600 transition-colors group-hover:text-trust-blue-500">Page</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full shadow-sm border border-gray-100/50 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-trust-blue-600 font-semibold transition-colors nav-link-hover relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-trust-blue-600 after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              user ? (
                <Button className="font-semibold shadow-md btn-hover rounded-full px-6 gap-2" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="hover:bg-trust-blue-50 font-semibold text-gray-700" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="font-semibold shadow-md btn-hover rounded-full px-6" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/50 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          'md:hidden fixed inset-x-0 top-[calc(100%+16px)] mx-4 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 ease-default overflow-hidden origin-top',
          isMobileMenuOpen
            ? 'scale-y-100 opacity-100 pointer-events-auto'
            : 'scale-y-0 opacity-0 pointer-events-none'
        )}
      >
        <div className="p-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-lg text-gray-800 hover:text-trust-blue-600 font-bold transition-colors border-b border-gray-100 last:border-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-6 flex flex-col gap-3">
            {!isLoading && (
              user ? (
                <Button className="w-full rounded-xl py-6 font-bold shadow-lg gap-2" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full rounded-xl py-6 font-bold" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="w-full rounded-xl py-6 font-bold shadow-lg" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
