'use client'

import { useState, useEffect, useRef } from 'react'

export default function AbonnementForm() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [avecLicence, setAvecLicence] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAdherent, setIsAdherent] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const PRIX = { semaine: isAdherent ? 4 : 8, licence: 45 }
  const montantAujourdhui = PRIX.semaine + (avecLicence ? PRIX.licence : 0)

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
        body: JSON.stringify({ nom, prenom, email, avecLicenceFfa: avecLicence }),
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

      {/* Licence FFA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Licence FFA</p>
        <div className="flex flex-col gap-3">
          {([
            { value: false, label: 'Je suis déjà licencié FFA', sub: 'Licencié AUNL ou autre club FFA', prix: 'Inclus', prixClass: 'text-green-600' },
            { value: true, label: "Je n'ai pas de licence FFA", sub: 'Licence annuelle obligatoire — prélevée une seule fois', prix: `+${PRIX.licence}€`, prixClass: 'text-gray-900' },
          ] as const).map((opt) => (
            <label key={String(opt.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${avecLicence === opt.value ? 'border-brand bg-brand-50' : 'border-gray-200'}`}>
              <input type="radio" name="licence" checked={avecLicence === opt.value} onChange={() => setAvecLicence(opt.value)} className="accent-brand" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-gray-400 font-medium">{opt.sub}</div>
              </div>
              <span className={`text-sm font-bold ${opt.prixClass}`}>{opt.prix}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Vos coordonnées</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
            <input type="text" required value={prenom} onChange={e => setPrenom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Marie" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
            <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Dupont" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
          <div className="relative">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand pr-8" placeholder="marie@example.com" />
            {checkingEmail && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">⟳</span>}
          </div>
          {!checkingEmail && isAdherent === true && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-600 text-sm">✓</span>
              <span className="text-xs font-semibold text-green-700">Adhérent AUNL — 4€/semaine</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-600 font-medium">Formule illimitée</span>
          <span className="font-semibold">{PRIX.semaine}€/semaine</span>
        </div>
        {avecLicence && (
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 font-medium">Licence FFA annuelle</span>
            <span className="font-semibold">{PRIX.licence}€ <span className="text-xs text-gray-400">(une fois)</span></span>
          </div>
        )}
        <div className="h-px bg-gray-100 my-3" />
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Aujourd&apos;hui</span>
          <span className="text-2xl font-bold tracking-tight">{montantAujourdhui}€</span>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Puis {PRIX.semaine}€/semaine · Engagement 4 semaines minimum · Résiliation libre ensuite
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 font-medium">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm">
          {loading ? 'Redirection…' : `Activer ma formule — ${montantAujourdhui}€ →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3 font-medium">Paiement sécurisé · Stripe · Confirmation par email</p>
      </div>
    </form>
  )
}
