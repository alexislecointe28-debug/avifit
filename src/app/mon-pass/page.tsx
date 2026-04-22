'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Pass {
  id: string
  nb_seances_restantes: number
  nb_seances_total: number
  achete_le: string
  expire_le: string
  statut: string
}

export default function MonPassPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pass, setPass] = useState<Pass | null>(null)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPass(null)
    const res = await fetch('/api/pass/mon-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    const data = await res.json()
    setLoading(false)
    setSubmitted(true)
    if (res.ok && data.pass) setPass(data.pass)
    else setError(data.error ?? 'Aucun pass trouvé pour cet email.')
  }

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const pct = pass ? Math.round(((pass.nb_seances_total - pass.nb_seances_restantes) / pass.nb_seances_total) * 100) : 0

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Mon espace</p>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Mon pass séances</h1>
          <p className="text-sm text-gray-500 font-medium mb-8">Consultez vos séances restantes.</p>

          {!submitted ? (
            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Votre email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand mb-3"
                placeholder="marie@example.com" autoFocus />
              <button type="submit" disabled={loading}
                className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm">
                {loading ? 'Recherche…' : 'Voir mon pass →'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {error && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                  <p className="text-sm text-gray-500 font-medium mb-3">{error}</p>
                  <Link href="/abonnement" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                    Acheter un pass →
                  </Link>
                </div>
              )}
              {pass && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-bold text-brand uppercase tracking-widest mb-1">Pass actif</div>
                      <div className="text-3xl font-black text-gray-900">{pass.nb_seances_restantes} <span className="text-lg font-semibold text-gray-400">/ {pass.nb_seances_total}</span></div>
                      <div className="text-sm text-gray-500 font-medium">séances restantes</div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-brand flex items-center justify-center">
                      <span className="text-lg font-black text-brand">{pass.nb_seances_restantes}</span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${100 - pct}%` }} />
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Acheté le</span>
                      <span className="font-semibold text-gray-700">{fmt(pass.achete_le)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expire le</span>
                      <span className="font-semibold text-gray-700">{fmt(pass.expire_le)}</span>
                    </div>
                  </div>

                  {pass.nb_seances_restantes === 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <p className="text-xs text-gray-400 mb-3">Toutes vos séances ont été utilisées</p>
                      <Link href="/abonnement" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                        Recharger un pass →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => { setSubmitted(false); setEmail(''); setPass(null); setError('') }}
                className="text-xs text-gray-400 hover:text-brand font-medium text-center">
                Chercher un autre email
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
