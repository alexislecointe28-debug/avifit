'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/seances', label: 'Séances', icon: '📅' },
  { href: '/admin/reservations', label: 'Réservations', icon: '✓' },
  { href: '/admin/abonnements', label: 'Abonnements', icon: '🔄' },
  { href: '/admin/adherents', label: 'Adhérents AUNL', icon: '👥' },
  { href: '/admin/coachs', label: 'Coachs', icon: '🏋️' },
  { href: '/admin/promos', label: 'Codes promo', icon: '🎟️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const NavContent = () => (
    <>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-brand-50 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <Link href="/" target="_blank" onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors mb-1">
          <span>↗</span> Voir le site
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <span>⎋</span> Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-gray-200 flex-col min-h-screen">
        <div className="p-5 border-b border-gray-200">
          <Image src="/avifit-logo.png" alt="Avifit" width={80} height={26} className="h-7 w-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">Admin</span>
        </div>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <Image src="/avifit-logo.png" alt="Avifit" width={70} height={24} className="h-6 w-auto" />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-gray-100">
          <div className="w-5 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white flex flex-col shadow-xl">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <Image src="/avifit-logo.png" alt="Avifit" width={70} height={24} className="h-6 w-auto mb-1" />
                <span className="text-[10px] text-gray-400 font-medium">Admin</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <NavContent />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
