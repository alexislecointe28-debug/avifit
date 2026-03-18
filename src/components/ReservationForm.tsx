'use client'

import { useState } from 'react'
import type { Seance } from '@/types'

interface Props {
  seance: Seance
}

type FormatAchat = 'seance' | 'forfait'

export default function ReservationForm({ seance }: Props) {
  const [format, setFormat] = useState<FormatAchat>('seance')
  const [licenceFFA, setLicenceFFA] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const prixSeance = seance.prix / 100
  const prixForfait = 80
  const prixLicence = 45

  const montantBase = format === 'forfait' ? prixForfait : prixSeance
  const montantTotal = montantBase + (licenceFFA ? prixLicence : 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nom || !form.prenom || !form.email) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email invalide.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seanceId: seance.id,
          format,
          licenceFFA,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Votre réservation</h2>

      {/* Format */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Formule</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'seance', label: 'Séance à l\'unité', prix: `${prixSeance}€` },
            { key: 'forfait', label: 'Forfait 10 séances', prix: `${prixForfait}€` },
          ] as { key: FormatAchat; label: string; prix: string }[]).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFormat(f.key)}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                format === f.key
                  ? 'border-brand bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{f.label}</div>
              <div className={`text-xl font-bold mt-1 ${format === f.key ? 'text-brand' : 'text-gray-900'}`}>
                {f.prix}
              </div>
              {f.key === 'forfait' && (
                <div className="text-xs text-gray-400 mt-0.5">valable 3 mois</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Licence FFA */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Licence FFA</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={licenceFFA}
            onChange={(e) => setLicenceFFA(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand accent-brand"
          />
          <span className="text-sm text-gray-600">
            Je n&apos;ai pas de licence FFA — ajouter la licence annuelle{' '}
            <span className="font-semibold text-gray-900">+{prixLicence}€</span>
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-2 ml-7">
          Obligatoire pour pratiquer. Gratuit si vous êtes déjà licencié UNL ou FFA.
        </p>
      </div>

      {/* Coordonnées */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Vos coordonnées</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Jean"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Dupont"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jean.dupont@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {/* Récap montant */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">
            {format === 'forfait' ? 'Forfait 10 séances' : 'Séance à l\'unité'}
            {licenceFFA && ' + Licence FFA'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Paiement sécurisé par Stripe</div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{montantTotal}€</div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirection...' : `Payer ${montantTotal}€ →`}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Annulation possible jusqu&apos;à 24h avant la séance
      </p>
    </form>
  )
}
