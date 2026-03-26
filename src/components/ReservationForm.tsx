'use client'

import { useState, useEffect, useRef } from 'react'
import type { Seance } from '@/types'

interface Props { seance: Seance }

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
  const [codePromo, setCodePromo] = useState('')
  const [promoStatus, setPromoStatus] = useState<{ valid: boolean; gratuit?: boolean; error?: string; description?: string } | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  const [remembered, setRemembered] = useState(false)
  const [consent, setConsent] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const promoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 🧠 Charger depuis localStorage si consentement précédent
  useEffect(() => {
    try {
      const hasConsent = localStorage.getItem('avifit_consent') === 'true'
      if (hasConsent) {
        setConsent(true)
        const saved = localStorage.getItem('avifit_user')
        if (saved) {
          const { prenom: p, nom: n, email: e, avecLicence: l } = JSON.parse(saved)
          if (p) setPrenom(p)
          if (n) setNom(n)
          if (e) setEmail(e)
          if (typeof l === 'boolean') setAvecLicence(l)
          setRemembered(true)
        }
      }
    } catch {}
  }, [])

  const PRIX = {
    seance: isAdherent ? 5 : 10,
    abonnement: isAdherent ? 4 : 8,
    licence: 45,
  }
  const montantBase = format === 'seance' ? PRIX.seance : PRIX.abonnement
  const montantTotal = promoStatus?.valid && promoStatus?.gratuit ? 0 :
    montantBase + (avecLicence ? PRIX.licence : 0)

  // Vérif adhérent
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!email || !email.includes('@')) { setIsAdherent(null); return }
    debounceRef.current = setTimeout(async () => {
      setCheckingEmail(true)
      try {
        const res = await fetch('/api/check-adherent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        const data = await res.json()
        setIsAdherent(data.adherent)
      } catch { setIsAdherent(null) }
      finally { setCheckingEmail(false) }
    }, 600)
  }, [email])

  // Vérif promo
  useEffect(() => {
    if (promoDebounceRef.current) clearTimeout(promoDebounceRef.current)
    if (!codePromo.trim()) { setPromoStatus(null); return }
    promoDebounceRef.current = setTimeout(async () => {
      setCheckingPromo(true)
      try {
        const res = await fetch('/api/check-promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: codePromo }) })
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

    // 💾 Sauvegarder dans localStorage (seulement si consentement)
    try {
      if (consent) {
        localStorage.setItem('avifit_consent', 'true')
        localStorage.setItem('avifit_user', JSON.stringify({ prenom, nom, email, avecLicence }))
      }
    } catch {}

    try {
      // Promo gratuite
      if (promoStatus?.valid && promoStatus?.gratuit) {
        const res = await fetch('/api/checkout/gratuit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seanceId: seance.id, nom, prenom, email, codePromo }) })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur'); setLoading(false); return }
        window.location.href = '/confirmation?type=promo'
        return
      }

      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seanceId: seance.id, nom, prenom, email, format, avecLicenceFfa: avecLicence }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('Erreur de connexion. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Mémorisé */}
      {remembered && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
          <span className="text-xs font-semibold text-brand">✓ Vos infos ont été retrouvées</span>
          <button type="button" onClick={() => { setPrenom(''); setNom(''); setEmail(''); setAvecLicence(false); setRemembered(false); localStorage.removeItem('avifit_user') }}
            className="text-xs text-brand hover:underline font-medium">Changer</button>
        </div>
      )}

      {/* Format */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Formule</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'seance', label: 'Séance unique', prix: `${PRIX.seance}€`, sub: 'Je paie à chaque fois' },
            { value: 'abonnement', label: 'Formule illimitée', prix: `${PRIX.abonnement}€/sem`, sub: 'Place auto · 1 mois min' },
          ] as const).map((f) => (
            <button key={f.value} type="button" onClick={() => setFormat(f.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${format === f.value ? 'border-brand bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-sm font-semibold mb-1">{f.label}</div>
              <div className={`text-xl font-bold tracking-tight ${format === f.value ? 'text-brand' : 'text-gray-900'}`}>{f.prix}</div>
              <div className="text-xs text-gray-400 mt-0.5">{f.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Coordonnées — simplifié */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Vos coordonnées</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
              <input type="text" required value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
              <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Dupont" />
            </div>
          </div>
          <div className="relative">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand pr-8" placeholder="marie@exemple.fr" />
            {checkingEmail && <span className="absolute right-3 bottom-3 text-xs text-gray-400">⟳</span>}
          </div>
          {!checkingEmail && isAdherent === true && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-green-600">✓</span>
              <span className="text-xs font-semibold text-green-700">Adhérent AUNL — tarif réduit appliqué</span>
            </div>
          )}
        </div>
      </div>

      {/* Licence FFA — simplifié, accordéon */}
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
            Licence FFA annuelle obligatoire si vous n&apos;êtes pas encore membre d&apos;un club FFA.
          </p>
        )}
      </div>

      {/* Code promo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Code promo</p>
        <div className="relative">
          <input type="text" value={codePromo} onChange={e => setCodePromo(e.target.value.toUpperCase())}
            placeholder="ESSAI-GRATUIT"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:border-brand uppercase" />
          {checkingPromo && <span className="absolute right-3 top-3 text-xs text-gray-400">⟳</span>}
        </div>
        {!checkingPromo && promoStatus?.valid && (
          <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <span className="text-green-600">✓</span>
            <span className="text-xs font-semibold text-green-700">{promoStatus.gratuit ? '🎉 Séance gratuite !' : promoStatus.description}</span>
          </div>
        )}
        {!checkingPromo && promoStatus && !promoStatus.valid && codePromo.trim() && (
          <p className="mt-2 text-xs text-red-600 font-medium">{promoStatus.error}</p>
        )}
      </div>

      {/* Consentement mémorisation */}
      <label className="flex items-start gap-3 cursor-pointer bg-white rounded-2xl border border-gray-200 p-4">
        <div className="relative flex-shrink-0 mt-0.5">
          <input type="checkbox" checked={consent} onChange={e => {
            setConsent(e.target.checked)
            if (!e.target.checked) { try { localStorage.removeItem('avifit_user'); localStorage.removeItem('avifit_consent') } catch {} }
          }} className="sr-only" />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${consent ? 'bg-brand border-brand' : 'border-gray-300'}`}>
            {consent && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900">Mémoriser mes infos pour la prochaine fois</span>
          <p className="text-xs text-gray-400 mt-0.5">Nom, prénom et email sauvegardés sur votre appareil uniquement. <a href="/politique-confidentialite" className="text-brand hover:underline" target="_blank">En savoir plus</a></p>
        </div>
      </label>

      {/* Total + CTA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-600">{format === 'seance' ? '1 séance' : 'Formule illimitée'}</span>
          <span className="font-semibold">{promoStatus?.valid && promoStatus?.gratuit ? <span className="line-through text-gray-400">{montantBase}€</span> : `${montantBase}€`}</span>
        </div>
        {avecLicence && !promoStatus?.gratuit && (
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Licence FFA</span>
            <span className="font-semibold">{PRIX.licence}€</span>
          </div>
        )}
        <div className="h-px bg-gray-100 my-3" />
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-black tracking-tight text-brand">{promoStatus?.valid && promoStatus?.gratuit ? '0€ 🎉' : `${montantTotal}€`}</span>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-3 font-medium">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white font-black py-4 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 text-base shadow-lg shadow-brand/20">
          {loading ? 'Redirection…' : promoStatus?.valid && promoStatus?.gratuit ? '✓ Réserver gratuitement' : `Payer ${montantTotal}€ →`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">🔒 Paiement sécurisé · Apple Pay & Google Pay acceptés</p>
      </div>
    </form>
  )
}
