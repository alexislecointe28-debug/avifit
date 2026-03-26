'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Seance } from '@/types'

interface CoachOption { id: string; prenom: string; nom: string }
interface Props {
  seance?: Seance
  mode: 'create' | 'edit'
  coachs?: CoachOption[]
}

export default function SeanceForm({ seance, mode, coachs = [] }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    titre: seance?.titre ?? 'Avifit',
    type: 'avifit_tous_niveaux' as import('@/types').SeanceType,
    date: seance?.date ?? '',
    heure_debut: seance?.heure_debut?.slice(0, 5) ?? '19:00',
    heure_fin: seance?.heure_fin?.slice(0, 5) ?? '20:00',
    places_max: seance?.places_max ?? 10,
    prix: seance ? seance.prix / 100 : 10,
    statut: seance?.statut ?? 'disponible',
    coach_id: '',  // sera mis à jour depuis la DB si edit
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = { ...form, prix: Math.round(form.prix * 100) }
    const url = mode === 'create' ? '/api/admin/seances' : `/api/admin/seances/${seance?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/seances')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur serveur')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette séance ? Cette action est irréversible.')) return
    setLoading(true)
    const res = await fetch(`/api/admin/seances/${seance?.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/seances')
      router.refresh()
    } else {
      setError('Erreur lors de la suppression')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
        {/* Coach */}
        {coachs.length > 0 && (
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Coach</label>
            <select value={form.coach_id} onChange={e => setForm(f => ({ ...f, coach_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand">
              <option value="">— Non attribué —</option>
              {coachs.map(c => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Horaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Heure début</label>
            <input
              type="time"
              required
              value={form.heure_debut}
              onChange={(e) => setForm(f => ({ ...f, heure_debut: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Heure fin</label>
            <input
              type="time"
              required
              value={form.heure_fin}
              onChange={(e) => setForm(f => ({ ...f, heure_fin: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Places + Prix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Places max</label>
            <input
              type="number"
              min={1}
              max={20}
              required
              value={form.places_max}
              onChange={(e) => setForm(f => ({ ...f, places_max: parseInt(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Prix (€)</label>
            <input
              type="number"
              min={1}
              step={0.01}
              required
              value={form.prix}
              onChange={(e) => setForm(f => ({ ...f, prix: parseFloat(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Statut (edit only) */}
        {mode === 'edit' && (
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm(f => ({ ...f, statut: e.target.value as import('@/types').SeanceStatut }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="disponible">Disponible</option>
              <option value="complet">Complet</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? 'Enregistrement…' : mode === 'create' ? 'Créer la séance' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Annuler
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto border border-red-200 text-red-600 font-medium px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  )
}
