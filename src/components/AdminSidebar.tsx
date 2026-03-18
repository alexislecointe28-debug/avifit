'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/seances', label: 'Séances', icon: '📅' },
  { href: '/admin/reservations', label: 'Réservations', icon: '✓' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-200">
        <Image src="/avifit-logo.png" alt="Avifit" width={80} height={26} className="h-7 w-auto mb-1" />
        <span className="text-[10px] text-gray-400 font-medium tracking-wide">Admin</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors mb-1"
        >
          <span>↗</span> Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <span>⎋</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}
