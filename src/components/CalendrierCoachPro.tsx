'use client'

import { useState, useEffect, useCallback } from 'react'

type Slot = {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  nb_coachs_max: number
  nb_reserves: number
  statut: string
}

type Resa = {
  id: string
  slot_id: string
  coach_slots: { date: string; heure_debut: string; heure_fin: string }
}

function getLundi(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const lundi = new Date(d.setDate(diff))
  return lundi.toISOString().split('T')[0]
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function CalendrierCoachPro({ email }: { email: string }) {
  const [lundi, setLundi] = useState(getLundi(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [resas, setResas] = useState<Resa[]>([])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [sRes, rRes] = await Promise.all([
      fetch(`/api/coach-slots/semaine?lundi=${lundi}`).then(r => r.json()),
      fetch(`/api/coach-reservations?email=${encodeURIComponent(email)}`).then(r => r.json()),
    ])
    setSlots(sRes.slots ?? [])
    setResas(rRes.reservations ?? [])
    setLoading(false)
  }, [lundi, email])

  useEffect(() => { load() }, [load])

  async function reserver(slotId: string) {
    setBooking(slotId)
    setMsg(null)
    const res = await fetch('/api/coach-reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, email }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg({ type: 'ok', text: '✅ Créneau réservé ! Confirmation par email.' })
      load()
    } else {
      setMsg({ type: 'err', text: data.error })
    }
    setBooking(null)
  }

  async function annuler(resaId: string) {
    setCancelling(resaId)
    setMsg(null)
    const res = await fetch(`/api/coach-reservations/${resaId}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      setMsg({ type: 'ok', text: '✅ Créneau annulé. 1h restituée à votre crédit.' })
      load()
    } else {
      setMsg({ type: 'err', text: data.error })
    }
    setCancelling(null)
  }

  // Grouper les slots par jour
  const slotsByDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = []
    slotsByDate[s.date].push(s)
  })

  const resasBySlot = new Map(resas.map(r => [r.slot_id, r]))

  const jours = Array.from({ length: 7 }, (_, i) => addDays(lundi, i))
  const today = new Date().toISOString().split('T')[0]

  function semainePrecedente() {
    setLundi(addDays(lundi, -7))
  }
  function semaineSuivante() {
    setLundi(addDays(lundi, 7))
  }

  const dimanche = addDays(lundi, 6)
  const labelSemaine = `${new Date(lundi + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → ${new Date(dimanche + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation semaine */}
      <div className="flex items-center justify-between">
        <button onClick={semainePrecedente}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          ← Préc.
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">{labelSemaine}</div>
          {loading && <div className="text-xs text-gray-400 mt-0.5">Chargement…</div>}
        </div>
        <button onClick={semaineSuivante}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          Suiv. →
        </button>
      </div>

      {/* Message feedback */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Grille semaine */}
      <div className="grid grid-cols-7 gap-1.5">
        {jours.map((date, i) => {
          const slotsDuJour = slotsByDate[date] ?? []
          const isPast = date < today
          const isToday = date === today
          const d = new Date(date + 'T00:00:00')
          return (
            <div key={date} className="flex flex-col gap-1">
              {/* Header jour */}
              <div className={`text-center py-2 rounded-xl ${isToday ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
                <div className="text-xs font-bold">{JOURS[i]}</div>
                <div className={`text-base font-black ${isToday ? 'text-white' : 'text-gray-800'}`}>
                  {d.getDate()}
                </div>
              </div>

              {/* Slots */}
              {slotsDuJour.length === 0 ? (
                <div className="h-12 rounded-xl bg-gray-50 border border-dashed border-gray-200" />
              ) : (
                slotsDuJour.map(slot => {
                  const maResa = resasBySlot.get(slot.id)
                  const plein = slot.nb_reserves >= slot.nb_coachs_max
                  const dispo = slot.nb_coachs_max - slot.nb_reserves
                  const isBooking = booking === slot.id
                  const isCancelling = maResa && cancelling === maResa.id

                  if (maResa) {
                    // Ma réservation
                    return (
                      <button key={slot.id} onClick={() => annuler(maResa.id)} disabled={!!isCancelling}
                        className="w-full rounded-xl p-1.5 text-center bg-brand text-white border-2 border-brand hover:bg-brand-700 transition-colors disabled:opacity-60">
                        <div className="text-xs font-bold">{slot.heure_debut.slice(0,5)}</div>
                        <div className="text-[10px] opacity-80">{isCancelling ? '…' : '✓ Moi'}</div>
                      </button>
                    )
                  }

                  if (isPast || plein) {
                    return (
                      <div key={slot.id}
                        className={`w-full rounded-xl p-1.5 text-center ${plein ? 'bg-red-50 border border-red-200' : 'bg-gray-100 border border-gray-200'}`}>
                        <div className={`text-xs font-bold ${plein ? 'text-red-500' : 'text-gray-400'}`}>{slot.heure_debut.slice(0,5)}</div>
                        <div className={`text-[10px] ${plein ? 'text-red-400' : 'text-gray-400'}`}>{plein ? 'Complet' : 'Passé'}</div>
                      </div>
                    )
                  }

                  return (
                    <button key={slot.id} onClick={() => reserver(slot.id)} disabled={!!booking}
                      className="w-full rounded-xl p-1.5 text-center bg-green-50 border border-green-300 hover:bg-green-100 hover:border-green-400 transition-colors disabled:opacity-60">
                      <div className="text-xs font-bold text-green-700">{slot.heure_debut.slice(0,5)}</div>
                      <div className="text-[10px] text-green-600">{isBooking ? '…' : `${dispo}/${slot.nb_coachs_max}`}</div>
                    </button>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand" /> Ma réservation</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Complet</span>
      </div>
    </div>
  )
}
