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

  const PRIX_PASS = isAdherent === true ? 29 : 49
  const PRIX_LICENCE = 45
  const total = PRIX_PASS + (avecLicence ? PRIX_LICENCE : 0)

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
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
              <span className="text-xs font-semibold text-green-700">Adhérent AUNL — tarif préférentiel 29€/mois</span>
            </div>
          )}
        </div>
      </div>

      {/* Licence FFA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Licence FFA</p>
            <p className="text-xs text-gray-400 mt-0.5">{avecLicence ? '+45€ ajoutés (non-licencié)' : 'Déjà licencié — inclus'}</p>
          </div>
          <button type="button" onClick={() => setAvecLicence(!avecLicence)}
            className={`relative w-12 h-6 rounded-full transition-colors ${avecLicence ? 'bg-brand' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${avecLicence ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        {avecLicence && (
          <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">
            Licence FFA annuelle obligatoire si vous n&apos;êtes pas encore membre d&apos;un club FFA. Prélevée une seule fois avec la 1ère mensualité.
          </p>
        )}
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-600 font-medium">Pass mensuel illimité</span>
          <span className="font-semibold">{PRIX_PASS}€/mois</span>
        </div>
        {isAdherent === true && (
          <div className="flex justify-between mb-2 text-sm text-green-600">
            <span className="font-medium">Tarif adhérent AUNL</span>
            <span className="font-semibold">-20€</span>
          </div>
        )}
        {avecLicence && (
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Licence FFA (une fois)</span>
            <span className="font-semibold">{PRIX_LICENCE}€</span>
          </div>
        )}
        <div className="h-px bg-gray-100 my-3" />
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold">Aujourd&apos;hui</span>
          <span className="text-2xl font-bold tracking-tight">{total}€</span>
        </div>
        <p className="text-xs text-gray-400 mb-5">Puis {PRIX_PASS}€/mois · Sans engagement · Résiliable à tout moment</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 font-medium">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm">
          {loading ? 'Redirection…' : `Souscrire au pass mensuel — ${total}€ →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3 font-medium">Paiement sécurisé · Stripe · Confirmation par email</p>
      </div>
    </form>
  )
}
