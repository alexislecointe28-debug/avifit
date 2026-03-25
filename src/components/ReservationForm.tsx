'use client'

import { useState, useEffect, useRef } from 'react'
import type { Seance } from '@/types'

interface Props {
  seance: Seance
}

export default function ReservationForm({ seance }: Props) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [avecLicence, setAvecLicence] = useState(false)
  const [format, setFormat] = useState<'seance' | 'abonnement'>('seance')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAdherent, setIsAdherent] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [codePromo, setCodePromo] = useState('')
  const [promoStatus, setPromoStatus] = useState<{ valid: boolean; gratuit?: boolean; error?: string; description?: string } | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  const promoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const PRIX = {
    seance: isAdherent ? 5 : 10,
    abonnement: isAdherent ? 4 : 8,
    licence: 45,
  }

  const montantBase = format === 'seance' ? PRIX.seance : PRIX.abonnement
  const montantTotal = montantBase + (avecLicence ? PRIX.licence : 0)

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

  useEffect(() => {
    if (promoDebounceRef.current) clearTimeout(promoDebounceRef.current)
    if (!codePromo.trim()) { setPromoStatus(null); return }
    promoDebounceRef.current = setTimeout(async () => {
      setCheckingPromo(true)
      try {
        const res = await fetch('/api/check-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codePromo }),
        })
        const data = await res.json()
        setPromoStatus(data)
      } catch { setPromoStatus(null) }
      finally { setCheckingPromo(false) }
    }, 500)
  }, [codePromo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Si code promo gratuit → réservation directe sans Stripe
      if (promoStatus?.valid && promoStatus?.gratuit) {
        const res = await fetch('/api/checkout/gratuit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seanceId: seance.id, nom, prenom, email, codePromo }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Une erreur est survenue'); setLoading(false); return }
        window.location.href = '/confirmation?type=promo'
        return
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seanceId: seance.id, nom, prenom, email, format, avecLicenceFfa: avecLicence }),
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

      {/* Format */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Formule</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setFormat('seance')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${format === 'seance' ? 'border-brand bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="text-sm font-semibold mb-1">Séance unique</div>
            <div className={`text-2xl font-bold tracking-tight ${format === 'seance' ? 'text-brand' : 'text-gray-900'}`}>{PRIX.seance}€</div>
            <div className="text-xs text-gray-400 mt-1">Je paie à chaque fois</div>
          </button>
          <button type="button" onClick={() => setFormat('abonnement')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${format === 'abonnement' ? 'border-brand bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-semibold">Formule illimitée</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">-20%</span>
            </div>
            <div className={`text-2xl font-bold tracking-tight ${format === 'abonnement' ? 'text-brand' : 'text-gray-900'}`}>{PRIX.abonnement}€<span className="text-sm font-medium text-gray-400">/sem</span></div>
            <div className="text-xs text-gray-400 mt-1">Place réservée auto · 1 mois min</div>
          </button>
        </div>

        {format === 'abonnement' && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Comment ça marche</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>→ Votre place est réservée automatiquement à chaque séance</li>
              <li>→ Prélèvement de {PRIX.abonnement}€ à chaque séance</li>
              <li>→ Engagement minimum 4 semaines (1 mois), puis résiliation libre</li>
              <li>→ Aucun prélèvement les semaines où la séance est annulée</li>
            </ul>
          </div>
        )}
      </div>

      {/* Licence FFA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Licence FFA</p>
        <div className="flex flex-col gap-3">
          {([
            { value: false, label: 'Je suis déjà licencié FFA', sub: 'Licencié AUNL ou autre club FFA', prix: 'Inclus', prixClass: 'text-green-600' },
            { value: true, label: "Je n'ai pas de licence FFA", sub: 'Licence annuelle obligatoire', prix: `+${PRIX.licence}€`, prixClass: 'text-gray-900' },
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
        {format === 'abonnement' && avecLicence && (
          <p className="text-xs text-gray-400 mt-2">La licence FFA est prélevée une seule fois à l&apos;inscription.</p>
        )}
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Vos coordonnées</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
            <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Marie" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
            <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Dupont" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
          <div className="relative">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand pr-8" placeholder="marie@example.com" />
            {checkingEmail && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-spin">⟳</span>}
          </div>
          {!checkingEmail && isAdherent === true && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-600 text-sm">✓</span>
              <span className="text-xs font-semibold text-green-700">Adhérent AUNL — tarif adhérent appliqué</span>
            </div>
          )}
          {!checkingEmail && isAdherent === false && email.includes('@') && (
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 font-medium">Tarif standard appliqué</span>
            </div>
          )}
        </div>
      </div>

      {/* Code promo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Code promo</p>
        <div className="relative">
          <input
            type="text"
            value={codePromo}
            onChange={e => setCodePromo(e.target.value.toUpperCase())}
            placeholder="ESSAI-GRATUIT"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand pr-8 uppercase"
          />
          {checkingPromo && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">⟳</span>}
        </div>
        {!checkingPromo && promoStatus?.valid && (
          <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <span className="text-green-600 text-sm">✓</span>
            <span className="text-xs font-semibold text-green-700">
              {promoStatus.gratuit ? 'Séance gratuite !' : promoStatus.description ?? 'Code valide'}
            </span>
          </div>
        )}
        {!checkingPromo && promoStatus && !promoStatus.valid && codePromo.trim() && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-red-600">{promoStatus.error}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-600 font-medium">
            {format === 'seance' ? '1 séance' : `Formule illimitée · ${PRIX.abonnement}€/semaine`}
          </span>
          <span className="font-semibold">{format === 'seance' ? `${montantBase}€` : `${PRIX.abonnement}€/sem`}</span>
        </div>
        {avecLicence && (
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 font-medium">Licence FFA annuelle</span>
            <span className="font-semibold">{PRIX.licence}€ <span className="text-gray-400 font-normal text-xs">(une fois)</span></span>
          </div>
        )}
        {isAdherent && (
          <div className="flex justify-between mb-2 text-sm text-green-700">
            <span className="font-medium">Tarif adhérent AUNL</span>
            <span className="font-semibold">✓</span>
          </div>
        )}
        <div className="h-px bg-gray-100 my-3" />
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold">
            {format === 'seance' ? 'Total' : "Aujourd'hui"}
          </span>
          <span className="text-2xl font-bold tracking-tight">{montantTotal}€</span>
        </div>
        {format === 'abonnement' && (
          <p className="text-xs text-gray-400 mb-4">
            Puis {PRIX.abonnement}€ prélevés automatiquement chaque semaine · Engagement 4 semaines minimum
          </p>
        )}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 font-medium">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm">
          {loading ? 'Redirection…' : format === 'seance' ? `Payer ${montantTotal}€ →` : `Activer ma formule — ${montantTotal}€ →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3 font-medium">Paiement sécurisé · Stripe · Confirmation par email</p>
      </div>
    </form>
  )
}
