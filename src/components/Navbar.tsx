'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const LINKS = [
  { href: '/#concept', label: 'Concept' },
  { href: '/planning', label: 'Planning' },
  { href: '/#tarifs', label: 'Tarifs' },
  { href: '/abonnement', label: 'Formule illimitée' },
  { href: '/mes-seances', label: 'Mes séances' },
  { href: '/mon-pass', label: 'Mon pass' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <Image src="/avifit-logo.png" alt="Avifit FFA" width={120} height={40} className="h-9 w-auto object-contain" priority />
            <span className="text-[10px] text-gray-400 tracking-wide pl-0.5">by AUNL</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <Image src="/aunl-logo.png" alt="AUNL" width={36} height={44} className="h-9 w-auto object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link href="/planning" className="hidden md:block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
          Réserver
        </Link>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-5 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-brand py-2.5 border-b border-gray-100 last:border-0 transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/planning" onClick={() => setOpen(false)}
            className="mt-3 bg-brand text-white text-sm font-semibold px-5 py-3 rounded-lg text-center hover:bg-brand-700 transition-colors">
            Réserver une séance
          </Link>
          <Link href="/coach/login" onClick={() => setOpen(false)}
            className="mt-2 text-xs text-center text-gray-400 hover:text-gray-600 font-medium py-2">
            🏋️ Accès coach
          </Link>
        </div>
      )}
    </nav>
  )
}
