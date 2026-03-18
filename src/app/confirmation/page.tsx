import Navbar from '@/components/Navbar'
import { createServiceClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return (
      <>
        <Navbar />
        <main className="bg-gray-50 min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Page introuvable</h1>
            <Link href="/planning" className="text-brand hover:underline text-sm">Retour au planning</Link>
          </div>
        </main>
      </>
    )
  }

  let nom = ''
  let prenom = ''
  let email = ''
  let seanceTitre = ''
  let seanceDate = ''
  let format = 'seance'

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    nom = session.metadata?.nom ?? ''
    prenom = session.metadata?.prenom ?? ''
    email = session.metadata?.email ?? session.customer_email ?? ''
    format = session.metadata?.format ?? 'seance'

    if (session.metadata?.seanceId) {
      const supabase = createServiceClient()
      const { data: seance } = await supabase
        .from('seances')
        .select('titre, date, heure_debut')
        .eq('id', session.metadata.seanceId)
        .single()
      if (seance) {
        seanceTitre = seance.titre
        const d = new Date(seance.date + 'T00:00:00')
        seanceDate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
          + ' à ' + seance.heure_debut.slice(0, 5)
      }
    }
  } catch (err) {
    console.error('Confirmation error:', err)
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-lg mx-auto text-center">

          {/* Icône succès */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Un email de confirmation a été envoyé à{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>

          {/* Récap */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Récapitulatif</h2>
            <div className="flex flex-col gap-3 text-sm">
              {prenom && nom && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Participant</span>
                  <span className="font-medium">{prenom} {nom}</span>
                </div>
              )}
              {format === 'forfait' ? (
                <div className="flex justify-between">
                  <span className="text-gray-400">Formule</span>
                  <span className="font-medium">Forfait 10 séances</span>
                </div>
              ) : seanceTitre && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Séance</span>
                    <span className="font-medium">{seanceTitre}</span>
                  </div>
                  {seanceDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="font-medium capitalize">{seanceDate}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Lieu</span>
                <span className="font-medium">Union Nautique de Lyon</span>
              </div>
            </div>
          </div>

          {/* Info pratique */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mb-8 text-left">
            <h3 className="text-sm font-semibold text-brand-800 mb-2">À savoir pour votre séance</h3>
            <ul className="text-xs text-brand-700 flex flex-col gap-1.5">
              <li>→ Arrivez 5 minutes avant le début</li>
              <li>→ Apportez une bouteille d&apos;eau</li>
              <li>→ Tenue de sport recommandée</li>
              <li>→ Annulation possible jusqu&apos;à 24h avant</li>
            </ul>
          </div>

          <Link
            href="/planning"
            className="inline-block bg-brand text-white font-medium px-8 py-3 rounded-xl text-sm hover:bg-brand-700 transition-colors"
          >
            Voir d&apos;autres créneaux
          </Link>

        </div>
      </main>
    </>
  )
}
