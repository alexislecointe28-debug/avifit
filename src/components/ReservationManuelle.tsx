'use client'

import { useState } from 'react'

interface Reservation {
  id: string
  client_prenom: string
  client_nom: string
  client_email: string
  montant_total: number
  avec_licence_ffa: boolean
  source?: string
}

interface Props {
  seanceId: string
  placesMax: number
  inscrits: Reservation[]
}

export default function ReservationManuelle({ seanceId, placesMax, inscrits: initialInscrits }: Props) {
  const [inscrits, setInscrits] = useState<Reservation[]>(initialInscrits)
  const [open, setOpen] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [montant, setMontant] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  const dispo = placesMax - inscrits.length

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/reservations/manuelle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seanceId, prenom, nom, email, montant: Math.round(parseFloat(montant) * 100) }),
    })
    const data = await res.json()
    if (res.ok) {
      setInscrits(prev => [...prev, data])
      setPrenom(''); setNom(''); setEmail(''); setMontant('0')
      setOpen(false)
    } else {
      setError(data.error ?? 'Erreur')
    }
    setLoading(false)
  }

  async function handleRemove(id: string) {
    if (!confirm('Retirer ce participant ?')) return
    setRemoving(id)
    const res = await fetch(`/api/admin/reservations/${id}/annuler`, { method: 'POST' })
    if (res.ok) {
      setInscrits(prev => prev.filter(r => r.id !== id))
    }
    setRemoving(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">
          Inscrits <span className="text-brand">{inscrits.length}/{placesMax}</span>
          {dispo === 0 && <span className="ml-2 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Complet</span>}
        </h2>
        <button onClick={() => setOpen(!open)} disabled={dispo === 0}
          className="flex items-center gap-1.5 text-xs font-bold bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <span className="text-base leading-none">+</span> Ajouter manuellement
        </button>
      </div>

      {/* Formulaire ajout manuel */}
      {open && (
        <form onSubmit={handleAdd} className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-brand uppercase tracking-widest">Réservation manuelle · {dispo} place(s) restante(s)</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
              <input required value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
                placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
              <input required value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
                placeholder="Dupont" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
                placeholder="optionnel" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Montant payé (€)</label>
              <input type="number" min="0" step="0.5" value={montant} onChange={e => setMontant(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white" />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand text-white text-sm font-bold py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60">
              {loading ? 'Ajout…' : '✓ Confirmer la réservation'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setError('') }}
              className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste inscrits */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {inscrits.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 font-medium">Aucun inscrit pour l&apos;instant</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Participant</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Montant</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {inscrits.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{r.client_prenom} {r.client_nom}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.client_email && <span className="text-xs text-gray-400">{r.client_email}</span>}
                      {r.source === 'manuel' && (
                        <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">📞 Manuel</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-gray-600">{(r.montant_total / 100).toFixed(0)}€</div>
                    {r.avec_licence_ffa && <div className="text-xs text-blue-500 font-medium">+ licence FFA</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(r.id)} disabled={removing === r.id}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors disabled:opacity-40">
                      {removing === r.id ? '…' : 'Retirer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
