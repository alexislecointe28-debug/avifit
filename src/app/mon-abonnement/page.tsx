'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function MonAbonnementPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const res = await fetch('/api/abonnement/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    const data = await res.json()

    if (res.ok) {
      setMessage(data.message)
    } else {
      setError(data.error ?? 'Erreur')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="text-xl font-bold tracking-tight mb-2">Ma formule illimitée</h1>
            <p className="text-sm text-gray-500 font-medium mb-6">
              Entrez votre email pour gérer ou résilier votre formule illimitée.
            </p>

            {message ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-semibold text-green-700">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleCancel} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Votre email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="marie@exemple.fr" />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full border border-red-200 text-red-600 font-semibold py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-60">
                  {loading ? 'Vérification…' : 'Résilier ma formule'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  La résiliation est effective à la fin de votre engagement minimum (4 semaines).
                  Aucun remboursement des semaines déjà prélevées.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
