'use client'

import { useState } from 'react'

const PACKS = [
  {
    key: 'seance',
    label: 'Séance à l\'unité',
    prix: '25€',
    heures: 1,
    prixHeure: '25€/h',
    desc: 'Parfait pour tester',
    badge: null,
  },
  {
    key: 'pack_10',
    label: 'Pack 10 heures',
    prix: '200€',
    heures: 10,
    prixHeure: '20€/h',
    desc: '-20% sur le tarif horaire',
    badge: 'Populaire',
  },
  {
    key: 'pack_20',
    label: 'Pack 20 heures',
    prix: '360€',
    heures: 20,
    prixHeure: '18€/h',
    desc: '-28% sur le tarif horaire',
    badge: 'Meilleure offre',
  },
] as const

type PackKey = (typeof PACKS)[number]['key']

export default function CoachProForm() {
  const [pack, setPack] = useState<PackKey>('pack_10')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [structure, setStructure] = useState('')
  const [declareAssure, setDeclareAssure] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selected = PACKS.find(p => p.key === pack)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!declareAssure) { setError('Vous devez déclarer être assuré en RC Pro.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/coach-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, tel, structure, typePack: pack, declareAssure }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Une erreur est survenue'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('Erreur de connexion. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Sélection du pack */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Choisissez votre formule</p>
        <div className="flex flex-col gap-3">
          {PACKS.map(p => (
            <button key={p.key} type="button" onClick={() => setPack(p.key)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${pack === p.key ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
              {p.badge && (
                <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${p.badge === 'Meilleure offre' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {p.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${pack === p.key ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                  {pack === p.key && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900">{p.label}</span>
                    <span className="text-sm text-gray-400">{p.heures}h</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-gray-900">{p.prix}</div>
                  <div className="text-xs text-gray-400">{p.prixHeure}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vos coordonnées</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
              <input type="text" required value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
              <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email professionnel *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="marie@coaching.fr" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Téléphone *</label>
            <input type="tel" required value={tel} onChange={e => setTel(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Structure / Nom commercial *</label>
            <input type="text" required value={structure} onChange={e => setStructure(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900"
              placeholder="Auto-entrepreneur Marie Dupont Coaching" />
            <p className="text-xs text-gray-400 mt-1">Nom sous lequel vous exercez votre activité de coaching.</p>
          </div>
        </div>
      </div>

      {/* Déclaration assurance */}
      <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors ${declareAssure ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
        <div className="relative flex-shrink-0 mt-0.5">
          <input type="checkbox" checked={declareAssure} onChange={e => setDeclareAssure(e.target.checked)} className="sr-only" />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${declareAssure ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
            {declareAssure && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900">Je déclare être assuré en Responsabilité Civile Professionnelle *</span>
          <p className="text-xs text-gray-500 mt-1">et exercer légalement mon activité de coach sportif indépendant. Je m&apos;engage à respecter le règlement intérieur de la salle.</p>
        </div>
      </label>

      {/* Total + CTA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>{selected.label}</span>
          <span className="font-semibold">{selected.prix}</span>
        </div>
        <div className="flex justify-between mb-1 text-sm text-gray-400">
          <span>Validité</span>
          <span>30 jours</span>
        </div>
        <div className="h-px bg-gray-100 my-3" />
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-black text-gray-900">{selected.prix}</span>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>}
        <button type="submit" disabled={loading || !declareAssure}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm">
          {loading ? 'Redirection…' : `Payer ${selected.prix} →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Paiement sécurisé · Stripe · Confirmation par email</p>
      </div>
    </form>
  )
}
