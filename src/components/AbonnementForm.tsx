'use client'

import { useState, useEffect, useRef } from 'react'

const FORMULES = [
  {
    key: 'saison_1x',
    label: '1 séance / semaine',
    prix: 280,
    prixAdherent: 180,
    detail: 'Septembre → juin · Licence FFA incluse',
    badge: null,
  },
  {
    key: 'saison_illimitee',
    label: 'Illimité',
    prix: 399,
    prixAdherent: 249,
    detail: 'Septembre → juin · Licence FFA incluse',
    badge: 'Meilleure offre',
  },
] as const

type FormuleKey = (typeof FORMULES)[number]['key']

export default function AbonnementForm() {
  const [formule, setFormule] = useState<FormuleKey>('saison_1x')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [isAdherent, setIsAdherent] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = FORMULES.find(f => f.key === formule)!
  const prix = isAdherent === true ? selected.prixAdherent : selected.prix

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!email || !email.includes('@')) { setIsAdherent(null); return }
    debounceRef.current = setTimeout(async () => {
      setCheckingEmail(true)
      try {
        const res = await fetch('/api/check-adherent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        setIsAdherent(data.adherent)
      } catch { setIsAdherent(null) }
      finally { setCheckingEmail(false) }
    }, 600)
  }, [email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/abonnement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, typeAbonnement: formule }),
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

      {/* Sélection formule */}
      <div className="flex flex-col gap-3">
        {FORMULES.map(f => {
          const p = isAdherent === true ? f.prixAdherent : f.prix
          return (
            <button key={f.key} type="button" onClick={() => setFormule(f.key)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${formule === f.key ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${formule === f.key ? 'border-brand bg-brand' : 'border-gray-300'}`}>
                  {formule === f.key && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${formule === f.key ? 'text-brand' : 'text-gray-900'}`}>{f.label}</span>
                    {f.badge && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand text-white">{f.badge}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{f.detail}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-black ${formule === f.key ? 'text-brand' : 'text-gray-900'}`}>{p}€</div>
                  <div className="text-xs text-gray-400">/ saison</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vos coordonnées</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
              <input type="text" required value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
              <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
            <div className="relative">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand pr-8"
                placeholder="marie@example.com" />
              {checkingEmail && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">⟳</span>}
            </div>
            {!checkingEmail && isAdherent === true && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-green-600 text-sm">✓</span>
                <span className="text-xs font-semibold text-green-700">Adhérent AUNL — tarif préférentiel appliqué</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Récap + CTA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{selected.label}</span>
          <span className="font-semibold">{prix}€</span>
        </div>
        <div className="flex justify-between text-sm mb-1 text-green-600">
          <span>Licence FFA incluse</span>
          <span className="font-semibold">✓</span>
        </div>
        <div className="flex justify-between text-sm mb-4 text-gray-400">
          <span>Validité</span>
          <span>jusqu&apos;au 30 juin 2026</span>
        </div>
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold">Total</span>
          <span className="text-3xl font-black tracking-tight text-brand">{prix}€</span>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm">
          {loading ? 'Redirection…' : `Souscrire — ${prix}€ →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Paiement sécurisé · Stripe · Confirmation par email</p>
      </div>
    </form>
  )
}
