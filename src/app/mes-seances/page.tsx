'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

interface Reservation {
  id: string
  seance_id: string
  statut: string
  montant_total: number
  avec_licence_ffa: boolean
  seances: {
    titre: string
    date: string
    heure_debut: string
    heure_fin: string
  }
}

export default function MesSeancesPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelMsg, setCancelMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null)

  function formatDate(date: string, heure: string) {
    const d = new Date(date + 'T00:00:00')
    const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    return `${jour.charAt(0).toUpperCase() + jour.slice(1)} · ${heure.slice(0, 5)}`
  }

  function canCancel(date: string, heure: string): { ok: boolean; msg: string } {
    const debut = new Date(`${date}T${heure}`)
    const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)
    if (debut <= cutoff) {
      return { ok: false, msg: "Annulation impossible — la séance est dans moins de 24h. Le prélèvement est maintenu." }
    }
    return { ok: true, msg: '' }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReservations([])

    const res = await fetch('/api/reservations/mes-seances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    const data = await res.json()
    if (res.ok) {
      setReservations(data)
      setSubmitted(true)
    } else {
      setError(data.error ?? 'Erreur')
    }
    setLoading(false)
  }

  async function handleCancel(id: string, date: string, heure: string) {
    const check = canCancel(date, heure)
    if (!check.ok) {
      setCancelMsg({ id, msg: check.msg, ok: false })
      return
    }
    if (!confirm('Confirmer l\'annulation de cette réservation ?')) return

    setCancellingId(id)
    const res = await fetch('/api/reservations/annuler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: id, email: email.trim().toLowerCase() }),
    })
    const data = await res.json()
    if (res.ok) {
      setReservations(prev => prev.filter(r => r.id !== id))
      setCancelMsg({ id, msg: 'Réservation annulée.', ok: true })
    } else {
      setCancelMsg({ id, msg: data.error ?? 'Erreur', ok: false })
    }
    setCancellingId(null)
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Mon espace</p>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Mes séances</h1>
          <p className="text-sm text-gray-500 font-medium mb-8">
            Retrouvez vos réservations à venir et annulez si besoin (jusqu&apos;à 24h avant).
          </p>

          {!submitted ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <form onSubmit={handleSearch} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Votre email de réservation</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="marie@exemple.fr" />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <button type="submit" disabled={loading}
                  className="bg-brand text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-brand-700 transition-colors disabled:opacity-60">
                  {loading ? 'Recherche…' : 'Voir mes séances →'}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 font-medium text-sm">Aucune séance à venir pour cet email.</p>
                  <button onClick={() => { setSubmitted(false); setEmail('') }}
                    className="mt-4 text-xs text-brand font-semibold hover:underline">
                    Chercher un autre email
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 font-medium mb-1">{reservations.length} séance{reservations.length > 1 ? 's' : ''} à venir</p>
                  {reservations.map(r => {
                    const s = r.seances
                    const check = canCancel(s.date, s.heure_debut)
                    const msg = cancelMsg?.id === r.id ? cancelMsg : null

                    return (
                      <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{s.titre}</div>
                            <div className="text-xs text-gray-500 font-medium mb-3">
                              {formatDate(s.date, s.heure_debut)} – {s.heure_fin.slice(0, 5)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {(r.montant_total / 100).toFixed(0)}€ payé
                              {r.avec_licence_ffa ? ' · dont licence FFA' : ''}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Confirmé</span>
                            {check.ok ? (
                              <button
                                onClick={() => handleCancel(r.id, s.date, s.heure_debut)}
                                disabled={cancellingId === r.id}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
                                {cancellingId === r.id ? 'Annulation…' : 'Annuler'}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 font-medium">Non annulable</span>
                            )}
                          </div>
                        </div>
                        {msg && (
                          <div className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {msg.msg}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <button onClick={() => { setSubmitted(false); setEmail('') }}
                    className="text-xs text-gray-400 hover:text-brand font-medium text-center mt-2">
                    ← Chercher un autre email
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 mb-1">Politique d&apos;annulation</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              L&apos;annulation est possible jusqu&apos;à <strong>24h avant</strong> la séance. Passé ce délai, le prélèvement est maintenu — la place ne peut plus être revendue.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
