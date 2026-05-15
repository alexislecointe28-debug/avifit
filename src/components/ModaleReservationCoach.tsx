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

type Step = 'email' | 'checking' | 'has_credit' | 'no_credit' | 'booking' | 'success'

const PACKS = [
  { key: 'seance' as const, label: 'Séance à l\'unité', prix: 25, heures: 1, detail: 'Pour aujourd\'hui' },
  { key: 'pack_10' as const, label: 'Pack 10 heures', prix: 200, heures: 10, detail: '20€/h · -20%', badge: 'Populaire' },
  { key: 'pack_20' as const, label: 'Pack 20 heures', prix: 360, heures: 20, detail: '18€/h · -28%', badge: 'Meilleure offre' },
]
type PackKey = 'seance' | 'pack_10' | 'pack_20'

interface Props {
  slot: Slot
  slotsJour: Slot[]
  onClose: () => void
}

// Calcule les créneaux consécutifs disponibles à partir du slot cliqué
function getConsecutifsDispos(clickedSlot: Slot, slotsJour: Slot[]): Slot[] {
  const sorted = [...slotsJour].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
  const idx = sorted.findIndex(s => s.id === clickedSlot.id)
  if (idx === -1) return [clickedSlot]
  
  const result: Slot[] = [clickedSlot]
  for (let i = idx + 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    // Consécutif = heure_fin du précédent === heure_debut du suivant
    if (prev.heure_fin === curr.heure_debut && curr.nb_reserves < curr.nb_coachs_max) {
      result.push(curr)
    } else break
  }
  return result
}

export default function ModaleReservationCoach({ slot, slotsJour, onClose }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [credit, setCredit] = useState<Credit | null>(null)
  const [duree, setDuree] = useState(1) // nb heures sélectionnées
  const [pack, setPack] = useState<PackKey>('pack_10')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [structure, setStructure] = useState('')
  const [tel, setTel] = useState('')
  const [declareAssure, setDeclareAssure] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  const consecutifs = getConsecutifsDispos(slot, slotsJour)
  const maxDuree = consecutifs.length
  const slotsSelectionnes = consecutifs.slice(0, duree)
  const slotFin = slotsSelectionnes[slotsSelectionnes.length - 1]

  useEffect(() => { emailRef.current?.focus() }, [])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Reset durée si dépasse le crédit dispo
  useEffect(() => {
    if (credit && duree > credit.nb_heures_restantes) {
      setDuree(Math.min(maxDuree, credit.nb_heures_restantes))
    }
  }, [credit, duree, maxDuree])

  const dateLabel = new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  async function verifierEmail(e: React.FormEvent) {
    e.preventDefault()
    setStep('checking')
    setErrMsg('')
    try {
      const res = await fetch('/api/coach-pro/mon-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      const actif = (data.credits ?? []).find((c: Credit) => c.nb_heures_restantes > 0)
      if (actif) { setCredit(actif); setStep('has_credit') }
      else setStep('no_credit')
    } catch { setStep('no_credit') }
  }

  async function reserver() {
    setStep('booking')
    setErrMsg('')
    const res = await fetch('/api/coach-reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotIds: slotsSelectionnes.map(s => s.id),
        email: email.trim().toLowerCase(),
      }),
    })
    const data = await res.json()
    if (res.ok) setStep('success')
    else { setErrMsg(data.error ?? 'Erreur'); setStep('has_credit') }
  }

  async function acheterEtReserver(e: React.FormEvent) {
    e.preventDefault()
    if (!declareAssure) { setErrMsg('Vous devez déclarer être assuré RC Pro.'); return }
    setErrMsg('')
    setStep('booking')
    const res = await fetch('/api/checkout/coach-pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, tel, structure, typePack: pack, declareAssure, slotId: slot.id }),
    })
    const data = await res.json()
    if (res.ok) window.location.href = data.url
    else { setErrMsg(data.error ?? 'Erreur'); setStep('no_credit') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-0.5">Réserver un créneau</p>
            <p className="font-bold text-gray-900 capitalize">{dateLabel}</p>
            <p className="text-sm text-gray-500">
              {slot.heure_debut.slice(0, 5)}
              {duree > 1 ? ` → ${slotFin.heure_fin.slice(0, 5)}` : ` → ${slot.heure_fin.slice(0, 5)}`}
              {duree > 1 && <span className="ml-1.5 text-brand font-semibold">{duree}h</span>}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-xl mt-1">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">

          {/* Sélecteur de durée (toujours visible dès qu'on connaît les dispo) */}
          {maxDuree > 1 && (step === 'email' || step === 'has_credit' || step === 'no_credit') && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Durée</p>
              <div className="flex gap-2">
                {Array.from({ length: maxDuree }, (_, i) => i + 1).map(h => {
                  const maxAllowed = credit ? Math.min(maxDuree, credit.nb_heures_restantes) : maxDuree
                  const disabled = step === 'has_credit' && h > maxAllowed
                  return (
                    <button key={h} type="button"
                      onClick={() => !disabled && setDuree(h)}
                      disabled={disabled}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2
                        ${duree === h ? 'bg-gray-900 text-white border-gray-900' : disabled ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                      {h}h
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {duree > 1
                  ? `${slot.heure_debut.slice(0,5)} → ${slotFin.heure_fin.slice(0,5)} · ${duree} crédits déduits`
                  : 'Créneaux consécutifs disponibles'}
              </p>
            </div>
          )}

          {/* ÉTAPE 1 — EMAIL */}
          {step === 'email' && (
            <form onSubmit={verifierEmail} className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Votre email</p>
                <p className="text-sm text-gray-500 mb-2">On vérifie si vous avez déjà du crédit.</p>
                <input ref={emailRef} type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="marie@coaching.fr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-700 transition-colors">
                Continuer →
              </button>
            </form>
          )}

          {/* VÉRIFICATION */}
          {step === 'checking' && (
            <div className="py-8 text-center text-gray-400">Vérification…</div>
          )}

          {/* CRÉDIT ACTIF */}
          {step === 'has_credit' && credit && (
            <div className="flex flex-col gap-3">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-700 mb-0.5">✓ Crédit disponible — {credit.nb_heures_restantes}h</p>
                <p className="text-xs text-gray-500">Bonjour {credit.coach_prenom} · expire le {new Date(credit.expire_le + 'T00:00:00').toLocaleDateString('fr-FR')}</p>
                {duree > credit.nb_heures_restantes && (
                  <p className="text-xs text-orange-600 font-semibold mt-1.5">Crédit insuffisant pour {duree}h — max {credit.nb_heures_restantes}h</p>
                )}
              </div>
              {errMsg && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>}
              <button onClick={reserver} disabled={duree > credit.nb_heures_restantes}
                className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm">
                ✓ Réserver {duree > 1 ? `${duree}h` : 'ce créneau'} — {duree} crédit{duree > 1 ? 's' : ''} déduit{duree > 1 ? 's' : ''}
              </button>
              <button onClick={() => setStep('email')} className="text-xs text-gray-400 text-center hover:text-gray-600">← Changer d&apos;email</button>
            </div>
          )}

          {/* PAS DE CRÉDIT */}
          {step === 'no_credit' && (
            <form onSubmit={acheterEtReserver} className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">Aucun crédit pour <strong>{email}</strong>. Achetez des heures pour réserver.</p>
              <div className="flex flex-col gap-2">
                {PACKS.map(p => (
                  <label key={p.key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${pack === p.key ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                    <input type="radio" name="pack" checked={pack === p.key} onChange={() => setPack(p.key)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${pack === p.key ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                      {pack === p.key && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{p.label}</span>
                        {'badge' in p && <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">{p.badge}</span>}
                      </div>
                      <span className="text-xs text-gray-400">{p.detail}</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg">{p.prix}€</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
                  <input type="text" required value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Marie" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input type="text" required value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Dupont" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Structure *</label>
                <input type="text" required value={structure} onChange={e => setStructure(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="Marie Dupont Coaching" /></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Téléphone *</label>
                <input type="tel" required value={tel} onChange={e => setTel(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" placeholder="06 12 34 56 78" /></div>
              <label className={`flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border-2 ${declareAssure ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${declareAssure ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`} onClick={() => setDeclareAssure(!declareAssure)}>
                  {declareAssure && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div><span className="text-sm font-semibold text-gray-900">Je suis assuré RC Pro *</span>
                  <p className="text-xs text-gray-400 mt-0.5">Coach sportif déclaré et assuré.</p></div>
              </label>
              {errMsg && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>}
              <button type="submit" disabled={!declareAssure} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-700 disabled:opacity-50 text-sm">
                Payer {PACKS.find(p => p.key === pack)?.prix}€ et réserver →
              </button>
              <button type="button" onClick={() => setStep('email')} className="text-xs text-gray-400 text-center hover:text-gray-600">← Changer d&apos;email</button>
            </form>
          )}

          {/* BOOKING */}
          {step === 'booking' && (
            <div className="py-8 text-center text-gray-400">Réservation en cours…</div>
          )}

          {/* SUCCÈS */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✓</div>
              <div>
                <p className="font-bold text-gray-900 text-lg mb-1">
                  {duree > 1 ? `${duree}h réservées !` : 'Créneau réservé !'}
                </p>
                <p className="text-sm text-gray-500 capitalize">{dateLabel}</p>
                <p className="text-sm text-gray-500">
                  {slot.heure_debut.slice(0,5)} → {slotFin.heure_fin.slice(0,5)}
                </p>
              </div>
              {credit && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                  Il vous reste <strong>{credit.nb_heures_restantes - duree}h</strong> de crédit
                </div>
              )}
              <p className="text-xs text-gray-400">Confirmation par email.</p>
              <button onClick={onClose} className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 text-sm">Fermer</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
