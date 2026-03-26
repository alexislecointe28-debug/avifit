'use client'

import { useState } from 'react'

interface Coach {
  id: string
  prenom: string
  nom: string
  email: string
  tarif_seance_ext: number
  tarif_seance_adh: number
  tarif_formule_ext: number
  tarif_formule_adh: number
  actif: boolean
}

export default function CoachManager({ initialCoachs }: { initialCoachs: Coach[] }) {
  const [coachs, setCoachs] = useState<Coach[]>(initialCoachs)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '',
    tarif_seance_ext: '600', tarif_seance_adh: '300',
    tarif_formule_ext: '480', tarif_formule_adh: '240',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTarifs, setEditTarifs] = useState<Partial<Coach>>({})

  const fmt = (cents: number) => (cents / 100).toFixed(2) + '€'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/coachs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: form.prenom, nom: form.nom, email: form.email.toLowerCase(), password: form.password,
        tarif_seance_ext: parseInt(form.tarif_seance_ext),
        tarif_seance_adh: parseInt(form.tarif_seance_adh),
        tarif_formule_ext: parseInt(form.tarif_formule_ext),
        tarif_formule_adh: parseInt(form.tarif_formule_adh),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setCoachs(prev => [...prev, data])
      setForm({ prenom: '', nom: '', email: '', password: '', tarif_seance_ext: '600', tarif_seance_adh: '300', tarif_formule_ext: '480', tarif_formule_adh: '240' })
    } else setError(data.error ?? 'Erreur')
    setLoading(false)
  }

  async function handleSaveTarifs(id: string) {
    const res = await fetch(`/api/admin/coachs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editTarifs),
    })
    if (res.ok) {
      setCoachs(prev => prev.map(c => c.id === id ? { ...c, ...editTarifs } : c))
      setEditingId(null)
    }
  }

  async function toggleActif(id: string, actif: boolean) {
    const res = await fetch(`/api/admin/coachs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !actif }),
    })
    if (res.ok) setCoachs(prev => prev.map(c => c.id === id ? { ...c, actif: !actif } : c))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Créer un coach */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold mb-4">Ajouter un coach</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Prénom</label>
              <input required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom</label>
              <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Dupont" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="marie@aunl.fr" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Mot de passe</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="••••••••" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Règle financière (en centimes)</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              ['Séance ext.', 'tarif_seance_ext', 'sur 10€'],
              ['Séance adh.', 'tarif_seance_adh', 'sur 5€'],
              ['Formule ext.', 'tarif_formule_ext', 'sur 8€'],
              ['Formule adh.', 'tarif_formule_adh', 'sur 4€'],
            ].map(([label, key, hint]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">{label} <span className="text-gray-400 font-normal">{hint}</span></label>
                <input type="number" value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" />
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            💡 Les tarifs sont en centimes. 600 = 6€. Accès : <strong>avifit.vercel.app/coach/login</strong>
          </div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60">
            {loading ? 'Création…' : 'Créer le coach'}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {coachs.map(c => (
          <div key={c.id} className={`bg-white rounded-xl border p-5 ${c.actif ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-base">{c.prenom} {c.nom}</div>
                <div className="text-xs text-gray-400 font-medium">{c.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.actif ? 'Actif' : 'Inactif'}
                </span>
                <button onClick={() => toggleActif(c.id, c.actif)}
                  className={`text-xs font-semibold ${c.actif ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                  {c.actif ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            </div>

            {editingId === c.id ? (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  ['Séance ext.', 'tarif_seance_ext'],
                  ['Séance adh.', 'tarif_seance_adh'],
                  ['Formule ext.', 'tarif_formule_ext'],
                  ['Formule adh.', 'tarif_formule_adh'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                    <input type="number"
                      defaultValue={c[key as keyof Coach] as number}
                      onChange={e => setEditTarifs(t => ({ ...t, [key]: parseInt(e.target.value) }))}
                      className="w-full border border-brand rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                  </div>
                ))}
                <div className="col-span-4 flex gap-2 mt-1">
                  <button onClick={() => handleSaveTarifs(c.id)}
                    className="bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-brand-700">Sauvegarder</button>
                  <button onClick={() => setEditingId(null)}
                    className="border border-gray-200 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-gray-50">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {[
                    ['Séance ext.', c.tarif_seance_ext, '10€'],
                    ['Séance adh.', c.tarif_seance_adh, '5€'],
                    ['Formule ext.', c.tarif_formule_ext, '8€'],
                    ['Formule adh.', c.tarif_formule_adh, '4€'],
                  ].map(([label, val, base]) => (
                    <div key={label as string} className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-400">{label as string} <span className="text-gray-300">/{base}</span></div>
                      <div className="text-sm font-black text-brand">{fmt(val as number)}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setEditingId(c.id); setEditTarifs({}) }}
                  className="text-xs font-semibold text-brand hover:underline shrink-0">Modifier</button>
              </div>
            )}
          </div>
        ))}
        {coachs.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400">Aucun coach — créez le premier ci-dessus</div>
        )}
      </div>
    </div>
  )
}
