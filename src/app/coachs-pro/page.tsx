import Navbar from '@/components/Navbar'
import CoachProForm from '@/components/CoachProForm'
import Link from 'next/link'
import Image from 'next/image'

export default function CoachsProPage() {
  const CRENEAUX = [
    { jour: 'Lundi – Vendredi', horaires: '9h – 12h', dispo: true },
    { jour: 'Lundi – Vendredi', horaires: '14h – 17h', dispo: true },
    { jour: 'Samedi', horaires: 'Sur demande', dispo: false },
  ]

  const REGLES = [
    'Réservation obligatoire 48h à l\'avance',
    'Maximum 2 coachs simultanément',
    'Maximum 3 clients par coach (8 personnes en tout)',
    'Réservation nominative — aucune sous-location',
    'Respect du matériel et nettoyage après séance',
    'Coach déclaré et assuré en RC Pro',
    'Heures valables 30 jours à partir de l\'achat',
  ]

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">

        {/* Hero */}
        <section className="bg-gray-900 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>›</span>
              <span>Coachs Pro</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Espace Coachs Professionnels</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              La salle.<br />
              <span className="text-gray-400">Pour vos clients.</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              Accédez à la salle musculation et aux ergomètres de l&apos;AUNL pour encadrer vos clients dans un cadre professionnel et qualitatif. Réservation en ligne, accès sur créneaux dédiés.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Matériel professionnel', 'Créneaux dédiés', 'Cadre structuré', 'AUNL Lyon'].map(tag => (
                <span key={tag} className="text-xs font-semibold bg-white/10 text-gray-300 px-3 py-1.5 rounded-full border border-white/10">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Galerie photos */}
        <section className="bg-gray-900 pb-10 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
                <Image src="/salle-1.jpg" alt="Salle musculation AUNL — vue générale" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
                <Image src="/salle-2.jpg" alt="Salle musculation AUNL — machines et ergomètres" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
                <Image src="/salle-3.jpg" alt="Salle musculation AUNL — vue en hauteur" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">Salle de musculation AUNL · 59 quai Clémenceau, Caluire-et-Cuire</p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Colonne gauche — infos */}
            <div className="flex flex-col gap-8">

              {/* Concept */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Le concept</p>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Un espace pro, pas une salle en libre accès</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  L&apos;AUNL met à disposition sa salle d&apos;entraînement équipée — ergomètres Concept2, matériel de musculation — pour des coachs indépendants souhaitant exercer dans un cadre professionnel.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Vous achetez des créneaux-heures, vous réservez vos séances à l&apos;avance, vous venez avec vos clients. L&apos;AUNL gère le cadre et le matériel.
                </p>
              </div>

              {/* Tarifs */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tarifs</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Séance à l\'unité', detail: '1 heure', prix: '25€', prixH: '25€/h' },
                    { label: 'Pack 10 heures', detail: 'Valable 30j', prix: '200€', prixH: '20€/h', eco: '-20%' },
                    { label: 'Pack 20 heures', detail: 'Valable 30j', prix: '360€', prixH: '18€/h', eco: '-28%' },
                  ].map(t => (
                    <div key={t.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                        <div className="text-xs text-gray-400">{t.detail} · {t.prixH}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">{t.prix}</div>
                        {'eco' in t && <div className="text-xs font-bold text-green-600">{t.eco}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Créneaux disponibles */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Créneaux disponibles</p>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {CRENEAUX.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{c.jour}</div>
                        <div className="text-xs text-gray-400">{c.horaires}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.dispo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.dispo ? 'Disponible' : 'Sur demande'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Les créneaux hors séances Avifit grand public. Contact pour réservation après achat.</p>
              </div>

              {/* Règles */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Règles d&apos;utilisation</p>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <ul className="flex flex-col gap-2.5">
                    {REGLES.map(r => (
                      <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-900 text-white rounded-xl p-5">
                <div className="text-sm font-bold mb-1">Une question ?</div>
                <div className="text-xs text-gray-400 mb-3">Contactez-nous avant d&apos;acheter si vous souhaitez visiter la salle ou vérifier la disponibilité.</div>
                <a href="mailto:avifit@aunl.fr" className="text-sm font-semibold text-white hover:text-gray-300 transition-colors">avifit@aunl.fr →</a>
              </div>

            </div>

            {/* Colonne droite — formulaire */}
            <div>
              <div className="sticky top-24">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Réservez vos heures</p>
                <CoachProForm />
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
