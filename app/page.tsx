'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check, ArrowRight, MessageCircle, Globe, Shield,
  BarChart2, Clock, Zap, ChevronDown, Star, MapPin,
  Calendar, Users, Wifi, Coffee, ParkingCircle,
} from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

// ─── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  green:      '#16C172',
  greenDark:  '#0EA560',
  greenLight: '#D1FAE5',
  greenMid:   '#A7F3D0',
  amber:      '#F59E0B',
  amberLight: '#FEF3C7',
  text:       '#0D0D0D',
  muted:      '#6B7280',
  border:     '#E5E7EB',
  borderMid:  '#D1D5DB',
  bg:         '#FFFFFF',
  bgFaint:    '#F9FAFB',
  bgGreen:    'rgba(22,193,114,0.06)',
}

const F = "'Outfit', 'DM Sans', sans-serif"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let cur = 0
        const step = Math.max(1, Math.ceil(to / 55))
        const id = setInterval(() => {
          cur = Math.min(cur + step, to)
          setN(cur)
          if (cur >= to) clearInterval(id)
        }, 22)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{prefix}{n.toLocaleString('en-IN')}{suffix}</span>
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: '20px 0' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: F, fontSize: '15px', fontWeight: 600, color: T.text,
      }}>
        {q}
        <ChevronDown size={17} style={{
          color: T.muted, flexShrink: 0, marginLeft: '16px',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease',
        }} />
      </button>
      {open && <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.75', color: T.muted, paddingRight: '28px' }}>{a}</p>}
    </div>
  )
}

// ─── Product mockup ───────────────────────────────────────────────────────────
function ProductMockup() {
  const rooms = [
    { name: 'Deluxe Room', price: '₹3,500', tag: 'Best value', tagColor: T.green },
    { name: 'Premium Suite', price: '₹5,200', tag: 'Popular', tagColor: T.amber },
  ]
  return (
    <div style={{
      width: '100%', maxWidth: '480px',
      background: T.bg, borderRadius: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08)',
      border: `1px solid ${T.border}`,
      overflow: 'hidden',
      fontFamily: F,
    }}>
      {/* Browser chrome */}
      <div style={{ background: T.bgFaint, borderBottom: `1px solid ${T.border}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{
          flex: 1, margin: '0 8px', background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: T.muted,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: T.green }} />
          bookpage.in/villa-serenity
        </div>
      </div>

      {/* Property hero */}
      <div style={{
        height: '100px',
        background: 'linear-gradient(135deg, #0f4c35 0%, #1a6b4a 50%, #0d3d2b 100%)',
        position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px 16px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '8px 8px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: T.green, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>VERIFIED</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Villa Serenity</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <MapPin size={9} /> Coorg, Karnataka · ★ 4.9 (38 reviews)
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Amenities */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {[{ icon: Wifi, label: 'WiFi' }, { icon: Coffee, label: 'Breakfast' }, { icon: ParkingCircle, label: 'Parking' }].map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: T.bgFaint, border: `1px solid ${T.border}`, borderRadius: '6px', padding: '4px 8px', fontSize: '10px', color: T.muted }}>
              <a.icon size={10} /> {a.label}
            </div>
          ))}
        </div>

        {/* Rooms */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Select Room</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {rooms.map((r, i) => (
            <div key={r.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '10px',
              border: `1.5px solid ${i === 0 ? T.green : T.border}`,
              background: i === 0 ? T.bgGreen : T.bg,
              cursor: 'pointer',
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: T.text }}>{r.name}</div>
                <div style={{ fontSize: '10px', color: T.muted, marginTop: '1px' }}>Up to 2 guests · King bed</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: T.text }}>{r.price}</div>
                <div style={{ fontSize: '9px', color: T.muted }}>per night</div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: r.tagColor, marginTop: '2px' }}>{r.tag}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Date row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[{ label: 'Check-in', val: 'Mar 15' }, { label: 'Check-out', val: 'Mar 18' }].map(d => (
            <div key={d.label} style={{ border: `1px solid ${T.border}`, borderRadius: '8px', padding: '7px 10px' }}>
              <div style={{ fontSize: '9px', color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: T.text, marginTop: '1px' }}>{d.val}</div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
          <span style={{ fontSize: '11px', color: T.muted }}>3 nights · 2 guests</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: T.text }}>₹10,500</span>
        </div>

        {/* CTA */}
        <div style={{
          background: T.green, borderRadius: '10px', padding: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          cursor: 'pointer',
        }}>
          <MessageCircle size={14} color="#fff" fill="#fff" />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Book on WhatsApp</span>
        </div>
      </div>
    </div>
  )
}

// ─── WA Typing ────────────────────────────────────────────────────────────────
const WA_MSG = `Hi! I'd like to book *Villa Serenity*\nRoom: Deluxe Room\nDates: 15 Mar – 18 Mar (3 nights)\nGuests: 2\nTotal: ₹10,500\n\nIs this available?`

function WaPhone() {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let i = 0
        const id = setInterval(() => {
          i++
          setText(WA_MSG.slice(0, i))
          if (i >= WA_MSG.length) { clearInterval(id); setDone(true) }
        }, 30)
        return () => clearInterval(id)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const lines = text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*(.+?)\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ margin: 0, minHeight: '1.4em' }} dangerouslySetInnerHTML={{ __html: parsed || '&nbsp;' }} />
  })

  return (
    <div ref={ref} style={{
      width: '260px', height: '520px',
      background: '#1A1A2E',
      borderRadius: '36px',
      border: '8px solid #111',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0', background: '#111' }}>
        <div style={{ width: '80px', height: '6px', background: '#333', borderRadius: '3px' }} />
      </div>
      {/* WA header */}
      <div style={{ background: T.green, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏨</div>
        <div>
          <div style={{ fontFamily: F, fontWeight: 700, fontSize: '13px', color: '#fff' }}>Villa Serenity</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>online now</div>
        </div>
      </div>
      {/* Chat bg */}
      <div style={{
        flex: 1, padding: '12px',
        background: '#ECE5DD',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          background: '#fff', borderRadius: '12px 12px 12px 2px',
          padding: '10px 13px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          fontSize: '12px', lineHeight: '1.6', color: '#111', fontFamily: F,
          maxWidth: '90%',
        }}>
          {lines}
          {!done && (
            <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '4px', verticalAlign: 'middle' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%', background: '#999',
                  display: 'inline-block', animation: 'dotBounce 1.2s infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </span>
          )}
          {done && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: '#888' }}>Just now <span style={{ color: T.green }}>✓✓</span></span>
            </div>
          )}
        </div>
      </div>
      {/* Input bar */}
      <div style={{ background: '#F0F0F0', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '7px 12px', fontSize: '11px', color: '#ccc', fontFamily: F }}>Type a message…</div>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={13} color="#fff" />
        </div>
      </div>
    </div>
  )
}

// ─── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, desc,
  accent = T.green, accentBg = T.bgGreen,
}: {
  icon: React.ElementType; title: string; desc: string;
  accent?: string; accentBg?: string;
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '28px', borderRadius: '20px',
        background: T.bg,
        border: `1px solid ${hov ? accent : T.border}`,
        boxShadow: hov
          ? `0 0 0 4px ${accentBg}, 0 8px 32px rgba(0,0,0,0.06)`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: hov ? accent : accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px',
        transition: 'background 0.22s ease',
        boxShadow: hov ? `0 4px 14px ${accentBg}` : 'none',
      }}>
        <Icon size={22} color={hov ? '#fff' : accent} strokeWidth={1.75} />
      </div>
      <h3 style={{ fontFamily: F, fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '13px', lineHeight: '1.65', color: T.muted, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: F, background: T.bg, color: T.text, overflowX: 'hidden' }}>
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '72px' }}>

        {/* Mesh background — tasteful, single-hue */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {/* Top-right green glow */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,193,114,0.10) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          {/* Bottom-left warm glow */}
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-60px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            mask: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 80%)',
            WebkitMask: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 80%)',
            opacity: 0.5,
          }} />
        </div>

        <div className="hero-split" style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1160px', margin: '0 auto',
          padding: 'clamp(60px,8vw,100px) 24px clamp(60px,7vw,80px)',
          display: 'flex', alignItems: 'center', gap: '48px',
        }}>
          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badge */}
            <div className="hero-in h1" style={{ marginBottom: '24px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: '100px', padding: '6px 14px 6px 8px',
                fontSize: '13px', fontWeight: 600, color: T.text,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: T.bgGreen, color: T.greenDark,
                  borderRadius: '100px', padding: '2px 8px', fontSize: '12px', fontWeight: 700,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                  New
                </span>
                Referral earnings now available
              </span>
            </div>

            <h1 className="hero-in h2" style={{
              fontFamily: F,
              fontSize: 'clamp(38px,5.5vw,68px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              margin: '0 0 22px',
              color: T.text,
            }}>
              Your hotel's direct<br />
              booking page —{' '}
              <span style={{
                color: T.green,
                position: 'relative',
                display: 'inline-block',
              }}>
                live in minutes
                {/* underline accent */}
                <svg aria-hidden viewBox="0 0 200 8" style={{
                  position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '6px',
                  overflow: 'visible',
                }}>
                  <path d="M2 5 Q50 1 100 4 Q150 7 198 3" stroke={T.green} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="hero-in h3" style={{
              fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.7,
              color: T.muted, margin: '0 0 36px', maxWidth: '480px',
            }}>
              Beautiful booking pages for independent hotels and homestays. No commissions, no tech skills, no middlemen — guests book directly over WhatsApp.
            </p>

            <div className="hero-in h4 hero-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <Link href="/signup" className="btn-green">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link href="/map" className="btn-outline">
                See live pages
              </Link>
            </div>

            {/* Proof row */}
            <div className="hero-in h5 hero-proof" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={T.amber} color={T.amber} />)}
                </div>
                <span style={{ fontSize: '13px', color: T.muted, marginLeft: '6px' }}>4.9 from 200+ hosts</span>
              </div>
              <div style={{ width: '1px', height: '16px', background: T.border }} />
              <span style={{ fontSize: '13px', color: T.muted }}>
                <strong style={{ color: T.text }}>500+</strong> properties live
              </span>
              <div style={{ width: '1px', height: '16px', background: T.border }} />
              <span style={{ fontSize: '13px', color: T.muted }}>
                <strong style={{ color: T.text }}>Zero</strong> commission
              </span>
            </div>
          </div>

          {/* Mockup */}
          <div className="mockup-wrap" style={{ flexShrink: 0, position: 'relative' }}>
            {/* Glow under mockup */}
            <div style={{
              position: 'absolute', inset: '20px -20px', zIndex: 0,
              background: 'radial-gradient(ellipse, rgba(22,193,114,0.15) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />
            <div className="mockup-float" style={{ position: 'relative', zIndex: 1 }}>
              <ProductMockup />
            </div>

            {/* Floating stat chip */}
            <div style={{
              position: 'absolute', top: '-12px', right: '-24px', zIndex: 2,
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: '12px', padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: T.bgGreen, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BarChart2 size={16} color={T.green} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: T.text, lineHeight: 1 }}>₹0</div>
                <div style={{ fontSize: '10px', color: T.muted, marginTop: '2px' }}>commission fee</div>
              </div>
            </div>

            {/* Floating notification chip */}
            <div style={{
              position: 'absolute', bottom: '40px', left: '-32px', zIndex: 2,
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: '12px', padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '8px',
              maxWidth: '190px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                background: '#DCF8C6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>💬</div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: T.text, lineHeight: 1.2 }}>New booking request</div>
                <div style={{ fontSize: '10px', color: T.muted, marginTop: '2px' }}>Via WhatsApp · just now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.bgFaint }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        }}>
          {[
            { label: 'Properties live', v: 500, s: '+' },
            { label: 'Avg. monthly bookings', v: 120, s: '+' },
            { label: 'Saved in OTA fees (avg)', v: 18, p: '', s: '%' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '28px 24px', textAlign: 'center',
              borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{ fontFamily: F, fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, color: T.text, lineHeight: 1, letterSpacing: '-0.03em' }}>
                <Counter to={s.v} prefix={s.p} suffix={s.s} />
              </div>
              <div style={{ fontSize: '13px', color: T.muted, marginTop: '6px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Features ──────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,9vw,112px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-block', background: T.bgGreen, border: `1px solid ${T.greenMid}`, borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.greenDark, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Features</div>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 auto 14px', maxWidth: '520px' }}>
            Everything to fill your rooms directly
          </h2>
          <p style={{ fontSize: '16px', color: T.muted, maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>One tool that replaces OTAs, middlemen, and complicated booking systems.</p>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          <FeatureCard icon={Globe}          title="Instant booking page"   desc="A shareable page with room listings, photos, and live availability — live in under 15 minutes." />
          <FeatureCard icon={MessageCircle}  title="WhatsApp booking"       desc="Guests get a pre-filled booking message that lands directly in your WhatsApp inbox." accent={T.green} />
          <FeatureCard icon={Clock}          title="Availability calendar"  desc="Block dates, set minimum stays, and let guests see real-time availability before messaging." />
          <FeatureCard icon={Shield}         title="Verified badge"         desc="A trust badge on your page tells guests you're a legitimate, verified property host." accent={T.amber} accentBg={T.amberLight} />
          <FeatureCard icon={BarChart2}      title="Referral earnings"      desc="Earn passive income by referring other properties. Your link, your commission." />
          <FeatureCard icon={Zap}            title="5-minute setup"         desc="No developers needed. Fill a form, add photos, and your page goes live instantly." accent={T.amber} accentBg={T.amberLight} />
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', padding: 'clamp(72px,9vw,112px) 24px', overflow: 'hidden', position: 'relative' }}>
        {/* subtle green tinge top */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(22,193,114,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(22,193,114,0.1)', border: '1px solid rgba(22,193,114,0.2)', borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</div>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
              Three steps to your first booking
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[
              { n: '01', title: 'Create your page', desc: 'Add your property name, photos, room types, and pricing. Takes less than 15 minutes.' },
              { n: '02', title: 'Share your link', desc: 'Get bookpage.in/your-property. Post it on Instagram, Google Business, WhatsApp status.' },
              { n: '03', title: 'Get direct bookings', desc: 'Guests browse, pick a room, and message you on WhatsApp. You negotiate and confirm.' },
            ].map(s => (
              <div key={s.n} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', padding: '32px 28px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Large ghost number */}
                <div style={{
                  position: 'absolute', top: '-8px', right: '16px',
                  fontFamily: F, fontSize: '72px', fontWeight: 900,
                  color: 'rgba(255,255,255,0.03)', lineHeight: 1,
                  userSelect: 'none', pointerEvents: 'none',
                }}>{s.n}</div>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: T.green, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F, fontSize: '13px', fontWeight: 800,
                  marginBottom: '20px', letterSpacing: '0.02em',
                }}>{s.n}</div>
                <h3 style={{ fontFamily: F, fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WhatsApp section ──────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,9vw,112px) 24px', maxWidth: '1060px', margin: '0 auto' }}>
        <div className="wa-split" style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
          <WaPhone />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: T.bgGreen, border: `1px solid ${T.greenMid}`, borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.greenDark, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Zero friction</div>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: '18px' }}>
              Guests message you.<br />No platform fee. Ever.
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: T.muted, marginBottom: '32px' }}>
              When a guest selects a room and dates, BookPage builds their entire booking request — room type, dates, guests, total — and opens WhatsApp pre-filled. One tap sends it straight to your phone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'No OTA commission taken from your revenue', color: T.green },
                { label: 'Guest details arrive in a structured, readable format', color: T.green },
                { label: 'You control the booking conversation from the start', color: T.green },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: T.bgGreen, border: `1.5px solid ${T.greenMid}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                  }}>
                    <Check size={12} color={T.green} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '15px', color: T.text, lineHeight: 1.5 }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────────────────── */}
      <section style={{
        background: T.bgFaint,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        padding: 'clamp(72px,9vw,112px) 24px',
      }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ display: 'inline-block', background: T.bgGreen, border: `1px solid ${T.greenMid}`, borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.greenDark, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Hosts love it</div>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              Real results from real properties
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
            {[
              { name: 'Rohan M.', loc: 'Coorg, Karnataka', quote: 'Set up in under 20 minutes. First WhatsApp booking arrived within 2 days of sharing the link on Instagram.' },
              { name: 'Divya S.',  loc: 'Manali, HP',       quote: 'I was paying 18% commission to OTAs. Now I keep everything. BookPage paid for itself in one booking.' },
              { name: 'Arjun P.', loc: 'Goa',              quote: 'Multiple guests said the page felt more personal and trustworthy than booking.com. That says it all.' },
            ].map(t => (
              <div key={t.name} style={{
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: '20px', padding: '28px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={T.amber} color={T.amber} />)}
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.75, color: T.text, marginBottom: '24px', fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: T.bgGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: T.green }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: T.muted }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ───────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,9vw,112px) 24px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ display: 'inline-block', background: T.bgGreen, border: `1px solid ${T.greenMid}`, borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.greenDark, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Pricing</div>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Simple, honest pricing</h2>
          <p style={{ fontSize: '16px', color: T.muted }}>Start free. No credit card. Upgrade when you're ready.</p>
        </div>

        <div className="pricing-split" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'stretch' }}>
          {/* Trial */}
          <div style={{
            flex: 1, maxWidth: '360px',
            border: `1px solid ${T.border}`, borderRadius: '24px',
            padding: '36px', background: T.bg,
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: T.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trial</div>
            <div style={{ fontFamily: F, fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: T.text, lineHeight: 1 }}>
              Free
            </div>
            <div style={{ fontSize: '13px', color: T.muted, marginTop: '4px', marginBottom: '28px' }}>for 30 days · no card needed</div>
            <div style={{ height: '1px', background: T.border, marginBottom: '24px' }} />
            {['Booking page', 'WhatsApp booking link', 'Availability calendar', 'Up to 5 room types'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '13px' }}>
                <Check size={15} color={T.green} strokeWidth={2.5} />
                <span style={{ fontSize: '14px', color: T.text }}>{f}</span>
              </div>
            ))}
            <Link href="/signup" className="btn-outline" style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', borderRadius: '12px' }}>
              Start free trial
            </Link>
          </div>

          {/* Pro */}
          <div style={{
            flex: 1, maxWidth: '360px',
            border: `2px solid ${T.green}`, borderRadius: '24px',
            padding: '36px',
            background: `linear-gradient(160deg, ${T.bg} 0%, rgba(22,193,114,0.04) 100%)`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle tint top-right */}
            <div aria-hidden style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(22,193,114,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: T.greenDark, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</div>
                <div style={{ background: T.green, color: '#fff', fontSize: '11px', fontWeight: 700, borderRadius: '100px', padding: '3px 10px' }}>MOST POPULAR</div>
              </div>
              <div style={{ fontFamily: F, fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: T.text, lineHeight: 1 }}>
                ₹999
              </div>
              <div style={{ fontSize: '13px', color: T.muted, marginTop: '4px', marginBottom: '28px' }}>per month · cancel anytime</div>
              <div style={{ height: '1px', background: T.greenMid, marginBottom: '24px' }} />
              {['Everything in Trial', 'Unlimited room types', 'Verified trust badge', 'Referral earnings', 'Priority support'].map(f => (
                <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '13px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: T.bgGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color={T.green} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '14px', color: T.text }}>{f}</span>
                </div>
              ))}
              <Link href="/signup" className="btn-green" style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', borderRadius: '12px' }}>
                Get started <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ background: T.bgFaint, borderTop: `1px solid ${T.border}`, padding: 'clamp(72px,9vw,112px) 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-block', background: T.bgGreen, border: `1px solid ${T.greenMid}`, borderRadius: '100px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, color: T.greenDark, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>FAQ</div>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Questions answered</h2>
          </div>
          {[
            { q: 'Do I need any technical skills?', a: 'None at all. If you can fill in a form on your phone, you can go live on BookPage. Most properties are up in under 15 minutes.' },
            { q: 'How does WhatsApp booking work?', a: 'When a guest picks a room and dates on your page, we build a complete booking request and open WhatsApp with it pre-filled. They tap Send — it arrives directly in your inbox.' },
            { q: 'Is there really zero commission?', a: 'Yes. We charge a flat monthly fee, never a percentage of your bookings. 100% of your room revenue is yours.' },
            { q: 'Can I manage availability?', a: 'Yes. Your dashboard has a full availability calendar. Block dates, set minimum stays, and mark specific rooms as unavailable.' },
            { q: 'What happens after the free trial?', a: "After 30 days you can upgrade to Pro for \u20b9999/month. Your page stays live. If you don\u2019t upgrade, your page is paused until you do." },
          ].map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          mask: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 80%)',
          WebkitMask: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 80%)',
          opacity: 0.4,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(34px,5.5vw,60px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '20px' }}>
            Your page. Your guests.<br />
            <span style={{ color: T.green }}>Your money.</span>
          </h2>
          <p style={{ fontSize: '17px', color: T.muted, marginBottom: '40px', lineHeight: 1.65 }}>
            Join 500+ independent properties saving lakhs in OTA commissions every year.
          </p>
          <Link href="/signup" className="btn-green" style={{ fontSize: '16px', padding: '16px 40px', borderRadius: '14px' }}>
            Start for free <ArrowRight size={17} />
          </Link>
          <p style={{ fontSize: '13px', color: T.muted, marginTop: '18px' }}>No credit card · Cancel anytime · Live in minutes</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
