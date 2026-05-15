'use client'

import { useState, useEffect, useRef } from 'react'

type Slot = {
  id: string
  slot_date: string
  heure_debut: string
  heure_fin: string
  nb_coachs_max: number
  nb_reserves: number
}

type Credit = {
  id: string
  nb_heures_restantes: number
  coach_nom: string
  coach_prenom: string
  coach_structure: string
  expire_le: string
}

type Step = 'email' | 'checking' | 'has_credit' | 'no_credit' | 'booking' | 'success' | 'error'

const PACKS = [
  { key: 'seance', label: 'Séance à l\'unité', prix: 25, heures: 1, detail: 'Pour aujourd\'hui' },
  { key: 'pack_10', label: 'Pack 10 heures', prix: 200, heures: 10, detail: '20€/h · -20%', badge: 'Populaire' },
  { key: 'pack_20', label: 'Pack 20 heures', prix: 360, heures: 20, detail: '18€/h · -28%', badge: 'Meilleure offre' },
] as const

type PackKey = (typeof PACKS)[number]['key']

interface Props {
  slot: Slot
  onClose: () => void
}

export default function ModaleReservationCoach({ slot, onClose }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [credit, setCredit] = useState<Credit | null>(null)
  const [pack, setPack] = useState<PackKey>('pack_10')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [structure, setStructure] = useState('')
  const [tel, setTel] = useState('')
  const [declareAssure, setDeclareAssure] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const dateLabel = new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const heureLabel = `${slot.heure_debut.slice(0, 5)} → ${slot.heure_fin.slice(0, 5)}`
  const dispo = slot.nb_coachs_max - slot.nb_reserves

  async function verifierEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setStep('checking')
    setErrMsg('')
    try {
      const res = await fetch('/api/coach-pro/mon-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      const credits: Credit[] = data.credits ?? []
      const actif = credits.find(c => c.nb_heures_restantes > 0)
      if (actif) {
        setCredit(actif)
        setStep('has_credit')
      } else {
        setStep('no_credit')
      }
    } catch {
      setStep('no_credit')
    }
  }

  async function reserver() {
    setStep('booking')
    setErrMsg('')
    try {
      const res = await fetch('/api/coach-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('success')
      } else {
        setErrMsg(data.error ?? 'Erreur')
        setStep('has_credit')
      }
    } catch {
      setErrMsg('Erreur de connexion')
      setStep('has_credit')
    }
  }

  async function acheterEtReserver(e: React.FormEvent) {
    e.preventDefault()
    if (!declareAssure) { setErrMsg('Vous devez déclarer être assuré RC Pro.'); return }
    setErrMsg('')
    setStep('booking')
    try {
      const res = await fetch('/api/checkout/coach-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, tel, structure, typePack: pack, declareAssure, slotId: slot.id }),
      })
      const data = await res.json()
      if (res.ok) {
        window.location.href = data.url
      } else {
        setErrMsg(data.error ?? 'Erreur')
        setStep('no_credit')
      }
    } catch {
      setErrMsg('Erreur de connexion')
      setStep('no_credit')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modale */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header fixe */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-bold text-brand uppercase tracking-widest">Créneau sélectionné</p>
            <p className="font-bold text-gray-900 capitalize">{dateLabel}</p>
            <p className="text-sm text-gray-500">{heureLabel} · {dispo} place{dispo > 1 ? 's' : ''} dispo</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-xl transition-colors">✕</button>
        </div>

        <div className="p-5">
          {/* ÉTAPE 1 — EMAIL */}
          {step === 'email' && (
            <form onSubmit={verifierEmail} className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Votre email</p>
                <p className="text-sm text-gray-500 mb-3">On vérifie si vous avez déjà du crédit.</p>
                <input ref={emailRef} type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="marie@coaching.fr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
              </div>
              <button type="submit"
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-700 transition-colors">
                Continuer →
              </button>
              <p className="text-xs text-center text-gray-400">Pas encore de compte ? On vous guide à l&apos;étape suivante.</p>
            </form>
          )}

          {/* VÉRIFICATION */}
          {step === 'checking' && (
            <div className="py-8 text-center">
              <div className="text-3xl mb-3">⟳</div>
              <p className="text-sm text-gray-500">Vérification en cours…</p>
            </div>
          )}

          {/* ÉTAPE 2A — CRÉDIT ACTIF */}
          {step === 'has_credit' && credit && (
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="font-semibold text-green-700">Crédit disponible</span>
                </div>
                <p className="text-sm text-gray-600">
                  Bonjour {credit.coach_prenom} · <strong>{credit.nb_heures_restantes}h</strong> restante{credit.nb_heures_restantes > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-400 mt-1">Expire le {new Date(credit.expire_le + 'T00:00:00').toLocaleDateString('fr-FR')}</p>
              </div>

              {errMsg && <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>}

              <button onClick={reserver}
                className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-colors text-sm">
                ✓ Réserver ce créneau — 1h déduite
              </button>
              <button onClick={() => setStep('email')} className="text-sm text-gray-400 text-center hover:text-gray-600">
                ← Changer d&apos;email
              </button>
            </div>
          )}

          {/* ÉTAPE 2B — PAS DE CRÉDIT */}
          {step === 'no_credit' && (
            <form onSubmit={acheterEtReserver} className="flex flex-col gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                Aucun crédit actif pour <strong>{email}</strong>. Achetez des heures pour réserver ce créneau.
              </div>

              {/* Sélection pack */}
              <div className="flex flex-col gap-2">
                {PACKS.map(p => (
                  <label key={p.key}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${pack === p.key ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                    <input type="radio" name="pack" value={p.key} checked={pack === p.key}
                      onChange={() => setPack(p.key)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${pack === p.key ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                      {pack === p.key && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{p.label}</span>
                        {'badge' in p && <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">{p.badge}</span>}
                      </div>
                      <span className="text-xs text-gray-400">{p.detail}</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg flex-shrink-0">{p.prix}€</span>
                  </label>
                ))}
              </div>

              {/* Infos si nouveau */}
              <div className="grid grid-cols-2 gap-2">
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
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Structure *</label>
                <input type="text" required value={structure} onChange={e => setStructure(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Marie Dupont Coaching" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Téléphone *</label>
                <input type="tel" required value={tel} onChange={e => setTel(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="06 12 34 56 78" />
              </div>

              {/* RC Pro */}
              <label className={`flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-colors ${declareAssure ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${declareAssure ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}
                  onClick={() => setDeclareAssure(!declareAssure)}>
                  {declareAssure && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">Je suis assuré en RC Pro *</span>
                  <p className="text-xs text-gray-400 mt-0.5">Coach sportif déclaré et assuré.</p>
                </div>
              </label>

              {errMsg && <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>}

              <button type="submit" disabled={!declareAssure}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm">
                Payer {PACKS.find(p => p.key === pack)?.prix}€ et réserver →
              </button>
              <button type="button" onClick={() => setStep('email')} className="text-sm text-gray-400 text-center hover:text-gray-600">
                ← Changer d&apos;email
              </button>
            </form>
          )}

          {/* BOOKING EN COURS */}
          {step === 'booking' && (
            <div className="py-8 text-center">
              <div className="text-3xl mb-3">⟳</div>
              <p className="text-sm text-gray-500">Réservation en cours…</p>
            </div>
          )}

          {/* SUCCÈS */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✓</div>
              <div>
                <p className="font-bold text-gray-900 text-lg mb-1">Créneau réservé !</p>
                <p className="text-sm text-gray-500 capitalize">{dateLabel}</p>
                <p className="text-sm text-gray-500">{heureLabel}</p>
              </div>
              {credit && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                  Il vous reste <strong>{credit.nb_heures_restantes - 1}h</strong> de crédit
                </div>
              )}
              <p className="text-xs text-gray-400">Un email de confirmation vous a été envoyé.</p>
              <button onClick={onClose}
                className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
