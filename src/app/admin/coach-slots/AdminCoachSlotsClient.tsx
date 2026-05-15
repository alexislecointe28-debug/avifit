'use client'

import { useState, useEffect, useCallback } from 'react'

type Resa = {
  id: string
  coach_nom: string
  coach_prenom: string
  coach_email: string
  coach_structure: string
  created_at: string
  coach_slots: { date: string; heure_debut: string; heure_fin: string }
}

type Slot = {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  nb_coachs_max: number
  nb_reserves: number
  statut: string
  coach_reservations: { id: string; coach_nom: string; coach_prenom: string; coach_email: string; coach_structure: string; statut: string }[]
}

function getLundi(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(new Date(d).setDate(diff)).toISOString().split('T')[0]
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function AdminCoachSlotsClient({ reservations }: { reservations: Resa[] }) {
  const [lundi, setLundi] = useState(getLundi(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', heureDebut: '09', heureFin: '12', recurrence: 'aucune', nbSemaines: '4' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/coach-slots?lundi=${lundi}`)
    const data = await res.json()
    setSlots(data.slots ?? [])
    setLoading(false)
  }, [lundi])

  useEffect(() => { load() }, [load])

  async function creerSlots() {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin/coach-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    })
    const data = await res.json()
    if (res.ok) { setMsg(`✅ ${data.created} créneau(x) créé(s)`); setShowForm(false); load() }
    else setMsg(`❌ ${data.error}`)
    setSaving(false)
  }

  async function supprimerSlot(id: string) {
    if (!confirm('Supprimer ce créneau ?')) return
    const res = await fetch(`/api/admin/coach-slots/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) { setSelectedSlot(null); load() }
    else alert(data.error)
  }

  const dimanche = addDays(lundi, 6)
  const jours = Array.from({ length: 7 }, (_, i) => addDays(lundi, i))
  const slotsByDate: Record<string, Slot[]> = {}
  slots.forEach(s => { if (!slotsByDate[s.date]) slotsByDate[s.date] = []; slotsByDate[s.date].push(s) })

  const heures = Array.from({ length: 14 }, (_, i) => String(i + 7).padStart(2, '0'))

  return (
    <div className="flex flex-col gap-6">
      {/* Réservations à venir */}
      {reservations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Réservations à venir ({reservations.length})</p>
          <div className="flex flex-col gap-2">
            {reservations.slice(0, 5).map(r => {
              const slot = r.coach_slots
              if (!slot) return null
              const dateStr = new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              return (
                <div key={r.id} className="flex items-center gap-3 text-sm bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
                  <span className="text-brand font-bold w-28 flex-shrink-0">{dateStr}</span>
                  <span className="text-gray-500">{slot.heure_debut.slice(0,5)}→{slot.heure_fin.slice(0,5)}</span>
                  <span className="font-semibold text-gray-800 flex-1">{r.coach_prenom} {r.coach_nom}</span>
                  <span className="text-xs text-gray-400">{r.coach_structure}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Header calendrier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setLundi(addDays(lundi, -7))}
            className="border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">← Préc.</button>
          <span className="text-sm font-bold text-gray-800">
            {new Date(lundi + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(dimanche + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            {loading && <span className="text-gray-400 font-normal ml-2">Chargement…</span>}
          </span>
          <button onClick={() => setLundi(addDays(lundi, 7))}
            className="border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">Suiv. →</button>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
          + Nouveau créneau
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Nouveau créneau</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">De</label>
              <select value={form.heureDebut} onChange={e => setForm(f => ({ ...f, heureDebut: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900">
                {heures.map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">À</label>
              <select value={form.heureFin} onChange={e => setForm(f => ({ ...f, heureFin: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900">
                {heures.map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Récurrence</label>
              <select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900">
                <option value="aucune">Aucune (ce jour uniquement)</option>
                <option value="hebdo">Chaque semaine</option>
                <option value="ouvrables">Jours ouvrables (lun→ven)</option>
              </select>
            </div>
          </div>
          {form.recurrence !== 'aucune' && (
            <div className="mb-4 w-40">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nb de semaines</label>
              <input type="number" min="1" max="20" value={form.nbSemaines}
                onChange={e => setForm(f => ({ ...f, nbSemaines: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900" />
            </div>
          )}
          <p className="text-xs text-gray-400 mb-4">
            Des blocs d&apos;1h seront créés entre {form.heureDebut}h et {form.heureFin}h. Ex : 9h→12h = 3 blocs.
          </p>
          {msg && <p className={`text-sm font-semibold mb-3 ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={creerSlots} disabled={saving || !form.date}
              className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Création…' : 'Créer les créneaux'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Calendrier admin */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[600px]">
          {jours.map((date, i) => {
            const slotsDuJour = slotsByDate[date] ?? []
            const d = new Date(date + 'T00:00:00')
            const today = new Date().toISOString().split('T')[0]
            return (
              <div key={date} className="flex flex-col gap-1.5">
                <div className={`text-center py-2 rounded-xl ${date === today ? 'bg-brand text-white' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-bold ${date === today ? 'text-white' : 'text-gray-500'}`}>{JOURS[i]}</div>
                  <div className={`text-base font-black ${date === today ? 'text-white' : 'text-gray-800'}`}>{d.getDate()}</div>
                </div>
                {slotsDuJour.map(slot => {
                  const reservations = slot.coach_reservations?.filter(r => r.statut === 'confirmed') ?? []
                  const plein = slot.nb_reserves >= slot.nb_coachs_max
                  const bgCls = plein ? 'bg-blue-50 border-blue-200' : reservations.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                  return (
                    <button key={slot.id} onClick={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                      className={`w-full rounded-xl p-2 text-center border transition-all ${bgCls} hover:shadow-sm`}>
                      <div className="text-xs font-bold text-gray-700">{slot.heure_debut.slice(0,5)}</div>
                      <div className="text-[10px] text-gray-500">{slot.nb_reserves}/{slot.nb_coachs_max}</div>
                    </button>
                  )
                })}
                {slotsDuJour.length === 0 && (
                  <div className="h-10 rounded-xl border border-dashed border-gray-200" />
                )}
              </div>
            )
          })}
        </div>

        {/* Détail slot sélectionné */}
        {selectedSlot && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900">
                {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedSlot.heure_debut.slice(0,5)} → {selectedSlot.heure_fin.slice(0,5)}
              </span>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">{selectedSlot.nb_reserves}/{selectedSlot.nb_coachs_max} coach(s)</span>
                {selectedSlot.nb_reserves === 0 && (
                  <button onClick={() => supprimerSlot(selectedSlot.id)}
                    className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            {(selectedSlot.coach_reservations?.filter(r => r.statut === 'confirmed') ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">Aucune réservation</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedSlot.coach_reservations.filter(r => r.statut === 'confirmed').map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="font-semibold text-sm text-gray-800">{r.coach_prenom} {r.coach_nom}</span>
                    <span className="text-xs text-gray-400">{r.coach_structure}</span>
                    <span className="text-xs text-gray-400 ml-auto">{r.coach_email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Libre</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" /> Partiellement réservé</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> Complet</span>
      </div>
    </div>
  )
}
