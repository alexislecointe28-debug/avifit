import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ConfirmationPage() {
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
          <h1 className="text-2xl font-semibold mb-3 tracking-tight">Réservation confirmée !</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Un email de confirmation vous a été envoyé. On vous accueille à l&apos;UNL bord de Saône — juste de l&apos;eau à apporter.
          </p>
          <Link href="/planning" className="inline-block bg-brand text-white font-medium px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors text-sm">
            Voir le planning
          </Link>
        </div>
      </main>
    </>
  )
}
