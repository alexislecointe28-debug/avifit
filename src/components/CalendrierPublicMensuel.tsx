'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ModaleReservationCoach from '@/components/ModaleReservationCoach'

type Slot = {
  id: string
  slot_date: string
  heure_debut: string
  heure_fin: string
  nb_coachs_max: number
  nb_reserves: number
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']


export default function CalendrierPublicMensuel() {
  const now = new Date()
  const [annee, setAnnee] = useState(now.getFullYear())
  const [mois, setMois] = useState(now.getMonth() + 1)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null)
  const [slotModal, setSlotModal] = useState<{ slot: Slot; slotsJour: Slot[] } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/coach-slots/mois?annee=${annee}&mois=${mois}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {}
    finally { setLoading(false) }
  }, [annee, mois])

  useEffect(() => { load() }, [load])

  function moisPrecedent() {
    if (mois === 1) { setAnnee(a => a - 1); setMois(12) }
    else setMois(m => m - 1)
    setJourSelectionne(null)
  }
  function moisSuivant() {
    if (mois === 12) { setAnnee(a => a + 1); setMois(1) }
    else setMois(m => m + 1)
    setJourSelectionne(null)
  }

  // Grouper slots par date
  const slotsByDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    if (!slotsByDate[s.slot_date]) slotsByDate[s.slot_date] = []
    slotsByDate[s.slot_date].push(s)
  })

  // Construire la grille du mois
  const premierJour = new Date(annee, mois - 1, 1)
  const dernierJour = new Date(annee, mois, 0)
  const offsetDebut = premierJour.getDay() === 0 ? 6 : premierJour.getDay() - 1
  const nbJours = dernierJour.getDate()

  const today = new Date().toISOString().split('T')[0]

  const cases: (string | null)[] = [
    ...Array(offsetDebut).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => {
      const d = new Date(annee, mois - 1, i + 1)
      return d.toISOString().split('T')[0]
    }),
  ]
  // Compléter jusqu'à multiple de 7
  while (cases.length % 7 !== 0) cases.push(null)

  const slotsJourSelectionne = jourSelectionne ? (slotsByDate[jourSelectionne] ?? []) : []

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <button onClick={moisPrecedent}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 font-bold">
          ←
        </button>
        <div className="text-center">
          <span className="font-bold text-gray-900">{MOIS[mois - 1]} {annee}</span>
          {loading && <span className="text-xs text-gray-400 ml-2">…</span>}
        </div>
        <button onClick={moisSuivant}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 font-bold">
          →
        </button>
      </div>

      {/* Calendrier */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
        {/* Header jours */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {JOURS.map(j => (
            <div key={j} className="text-center py-2 text-xs font-bold text-gray-400">{j}</div>
          ))}
        </div>

        {/* Cases */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {cases.map((dateStr, i) => {
            if (!dateStr) return <div key={`empty-${i}`} className="bg-gray-50 min-h-[70px]" />

            const slotsJour = slotsByDate[dateStr] ?? []
            const isPast = dateStr < today
            const isToday = dateStr === today
            const isSelected = jourSelectionne === dateStr
            const jour = new Date(dateStr + 'T00:00:00').getDate()

            return (
              <button key={dateStr}
                onClick={() => !isPast && slotsJour.length > 0 && setJourSelectionne(isSelected ? null : dateStr)}
                disabled={isPast || slotsJour.length === 0}
                className={`min-h-[70px] p-1.5 flex flex-col gap-1 transition-colors text-left
                  ${isSelected ? 'bg-brand-50' : isPast ? 'bg-gray-50' : slotsJour.length > 0 ? 'hover:bg-gray-50 cursor-pointer' : ''}
                  ${isToday ? 'ring-2 ring-inset ring-brand' : ''}`}>
                {/* Numéro du jour */}
                <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-brand text-white' : isPast ? 'text-gray-300' : 'text-gray-700'}`}>
                  {jour}
                </span>

                {/* Créneaux */}
                <div className="flex flex-col gap-0.5 w-full">
                  {slotsJour.slice(0, 3).map(s => {
                    const plein = s.nb_reserves >= s.nb_coachs_max
                    return (
                      <span key={s.id}
                        onClick={e => { if (!plein && !isPast) { e.stopPropagation(); setSlotModal({ slot: s, slotsJour: slotsByDate[s.slot_date] ?? [] }) } }}
                        className={`text-[9px] font-bold px-1 py-0.5 rounded text-center leading-none transition-colors
                          ${plein ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'}`}>
                        {s.heure_debut.slice(0, 5)}
                      </span>
                    )
                  })}
                  {slotsJour.length > 3 && (
                    <span className="text-[9px] text-gray-400 font-medium text-center">+{slotsJour.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Détail jour sélectionné */}
      {jourSelectionne && slotsJourSelectionne.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">
              {new Date(jourSelectionne + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <button onClick={() => setJourSelectionne(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          <div className="flex flex-col gap-2">
            {slotsJourSelectionne.map(s => {
              const plein = s.nb_reserves >= s.nb_coachs_max
              const dispo = s.nb_coachs_max - s.nb_reserves
              return (
                <div key={s.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border
                  ${plein ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                  <div>
                    <span className="font-bold text-sm text-gray-900">
                      {s.heure_debut.slice(0, 5)} → {s.heure_fin.slice(0, 5)}
                    </span>
                    <span className={`ml-2 text-xs font-semibold ${plein ? 'text-gray-400' : 'text-green-600'}`}>
                      {plein ? 'Complet' : `${dispo} place${dispo > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  {!plein && (
                    <button onClick={() => setSlotModal({ slot: s, slotsJour: slotsJourSelectionne })}
                      className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                      Réserver →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modale réservation */}
      {slotModal && <ModaleReservationCoach slot={slotModal.slot} slotsJour={slotModal.slotsJour} onClose={() => setSlotModal(null)} />}

      {/* Légende + CTA */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-300" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200" />
            Complet
          </span>
        </div>
        <Link href="/mon-credit-coach"
          className="text-xs font-bold text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          Gérer mes réservations →
        </Link>
      </div>
    </div>
  )
}
