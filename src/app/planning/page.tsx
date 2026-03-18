import Navbar from '@/components/Navbar'

export default function PlanningPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Planning</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-4">Réservez votre séance</h1>
        <p className="text-gray-500 text-sm mb-12">Choisissez un créneau disponible, payez en ligne — c&apos;est tout.</p>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-brand-800 mb-2">Planning en cours de configuration</h2>
          <p className="text-sm text-brand-600">Les créneaux seront disponibles très prochainement.</p>
        </div>
      </main>
    </>
  )
}
