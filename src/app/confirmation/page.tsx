import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Props {
  searchParams: { type?: string; cancelled?: string }
}

export default function ConfirmationPage({ searchParams }: Props) {
  const isAbonnement = searchParams.type === 'abonnement'
  const isCancelled = searchParams.cancelled === '1'

  if (isCancelled) {
    return (
      <>
        <Navbar />
        <main className="bg-gray-50 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">↩</span>
            </div>
            <h1 className="text-xl font-bold mb-3 tracking-tight">Paiement annulé</h1>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              Votre réservation n&apos;a pas été finalisée. Aucun prélèvement n&apos;a été effectué.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/planning" className="bg-brand text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-700 transition-colors">
                Réessayer
              </Link>
              <Link href="/" className="border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Accueil
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {isAbonnement ? (
            <>
              <h1 className="text-2xl font-bold mb-3 tracking-tight">Formule illimitée activée !</h1>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                Votre place du mercredi est désormais réservée automatiquement chaque semaine. Un email de confirmation vous a été envoyé.
              </p>
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-8 text-left">
                <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Rappel</div>
                <div className="text-sm text-gray-600 font-medium space-y-1">
                  <div>📅 Place réservée chaque mercredi</div>
                  <div>💳 8€/semaine prélevés automatiquement</div>
                  <div>🔒 Sans engagement après 1 mois · résiliation libre ensuite</div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/" className="bg-brand text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-700 transition-colors">
                  Accueil
                </Link>
                <Link href="/mon-abonnement" className="border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Mon abonnement
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-3 tracking-tight">Réservation confirmée !</h1>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                Un email de confirmation vous a été envoyé. On vous accueille à l&apos;AUNL — 59 quai Clémenceau, Caluire-et-Cuire — juste de l&apos;eau à apporter.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/planning" className="bg-brand text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-700 transition-colors">
                  Voir le planning
                </Link>
                <Link href="/" className="border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Accueil
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
