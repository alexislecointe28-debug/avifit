'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

type Credit = {
  type_achat: string
  nb_heures_total: number
  nb_heures_restantes: number
  montant: number
  achete_le: string
  expire_le: string
}

const LABELS: Record<string, string> = {
  seance: "Séance à l'unité",
  pack_10: 'Pack 10 heures',
  pack_20: 'Pack 20 heures',
}

export default function MonCreditCoachPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<Credit[] | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch('/api/coach-pro/mon-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      setCredits(data.credits ?? [])
    } catch {
      setCredits([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const totalRestant = credits?.reduce((sum, c) => sum + c.nb_heures_restantes, 0) ?? 0

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link href="/coachs-pro" className="hover:text-gray-700 transition-colors">Coachs Pro</Link>
            <span>›</span>
            <span className="text-gray-600">Mon crédit heures</span>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Coachs Pro</p>
          <h1 className="text-2xl font-bold tracking-tight mb-8">Mon crédit heures</h1>

          {/* Formulaire */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email utilisé lors de l&apos;achat</label>
            <div className="flex gap-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900"
                placeholder="marie@coaching.fr" />
              <button type="submit" disabled={loading}
                className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-60">
                {loading ? '⟳' : 'Voir'}
              </button>
            </div>
          </form>

          {/* Résultats */}
          {searched && credits !== null && (
            credits.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Aucun crédit actif trouvé</p>
                <p className="text-xs text-gray-400 mb-5">Vérifiez l&apos;email utilisé lors de l&apos;achat.</p>
                <Link href="/coachs-pro" className="text-sm font-semibold text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Acheter des heures →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Total */}
                <div className="bg-gray-900 text-white rounded-2xl p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total disponible</div>
                  <div className="text-5xl font-black tracking-tight">{totalRestant}<span className="text-2xl font-medium text-gray-400 ml-2">h</span></div>
                  <div className="text-sm text-gray-400 mt-1">Sur {credits.reduce((s, c) => s + c.nb_heures_total, 0)}h achetées</div>
                </div>

                {/* Détail par pack */}
                {credits.map((c, i) => {
                  const pct = Math.round((c.nb_heures_restantes / c.nb_heures_total) * 100)
                  const expire = new Date(c.expire_le + 'T00:00:00')
                  const joursRestants = Math.ceil((expire.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-bold text-gray-900">{LABELS[c.type_achat] ?? c.type_achat}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Acheté le {new Date(c.achete_le + 'T00:00:00').toLocaleDateString('fr-FR')}</div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${joursRestants <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {joursRestants}j restants
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-gray-900 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-sm font-bold text-gray-900 w-16 text-right">{c.nb_heures_restantes}h / {c.nb_heures_total}h</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Expire le {expire.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )
                })}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 font-medium">
                  📅 Pour réserver un créneau, contactez-nous : <a href="mailto:avifit@aunl.fr" className="font-bold hover:underline">avifit@aunl.fr</a>
                </div>

                <Link href="/coachs-pro" className="text-center text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors py-2">
                  + Acheter des heures supplémentaires
                </Link>
              </div>
            )
          )}
        </div>
      </main>
    </>
  )
}
