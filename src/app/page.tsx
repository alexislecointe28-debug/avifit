import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function placesTag(max: number, reservees: number) {
  const dispo = max - reservees
  if (dispo === 0) return { label: 'Complet', cls: 'bg-red-100 text-red-700' }
  if (dispo <= 2) return { label: `Plus que ${dispo} place${dispo > 1 ? 's' : ''}`, cls: 'bg-orange-100 text-orange-700' }
  if (dispo <= 4) return { label: `${dispo} places`, cls: 'bg-yellow-100 text-yellow-700' }
  return { label: `${dispo} places`, cls: 'bg-green-100 text-green-700' }
}

function formatJourHeure(date: string, heure: string) {
  const d = new Date(date + 'T00:00:00')
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${jour.charAt(0).toUpperCase() + jour.slice(1)} · ${heure.slice(0, 5)}`
}

export default async function HomePage() {
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: prochainesSeances } = await supabase
    .from('seances')
    .select('*')
    .gte('date', today)
    .neq('statut', 'annule')
    .order('date', { ascending: true })
    .order('heure_debut', { ascending: true })
    .limit(3)
  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative border-b border-gray-200 py-20 px-6 overflow-hidden">
          {/* Background photo */}
          <div className="absolute inset-0">
            <Image src="/photo-unl-coach.jpg" alt="Coach Avifit AUNL" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
          </div>
          <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-200 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                Labellisé Avifit® · FFA
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
                L&apos;aviron indoor<br />
                pour <span className="text-brand">tout le monde.</span>
              </h1>
              <p className="text-base text-gray-600 leading-relaxed font-medium mb-6 max-w-md">
                Cours collectifs sur ergomètre, 1h, 10 personnes max. Encadré par un coach certifié FFA. Aucun prérequis.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/planning" className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
                  Voir le planning
                </Link>
                <a href="#concept" className="border border-brand text-brand text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors">
                  En savoir plus
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Planning widget — données réelles Supabase */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prochaines séances</p>
                {prochainesSeances && prochainesSeances.length > 0 ? (
                  prochainesSeances.map((s) => {
                    const tag = placesTag(s.places_max, s.places_reservees)
                    const dispo = s.places_max - s.places_reservees
                    return (
                      <div key={s.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2.5 mb-2 last:mb-0">
                        <span className="text-sm font-semibold text-gray-900 flex-1 leading-tight">{formatJourHeure(s.date, s.heure_debut)}</span>
                        {dispo > 0 ? (
                          <Link href={`/reserver/${s.id}`} className="text-xs font-bold text-brand hover:underline shrink-0">
                            Réserver
                          </Link>
                        ) : null}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${tag.cls}`}>{tag.label}</span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-3 font-medium">Aucune séance programmée pour le moment</p>
                )}
                <Link href="/planning" className="block mt-3 text-center text-xs font-semibold text-brand hover:underline">
                  Voir tous les créneaux →
                </Link>
              </div>

              {/* Tarifs inline */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tarifs</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className="text-xl font-bold text-gray-900">10€</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">Séance unique</div>
                  </div>
                  <div className="bg-brand-50 rounded-lg px-3 py-2.5 border border-brand-100">
                    <div className="text-xl font-bold text-brand">8€<span className="text-sm font-medium text-brand-400">/sem</span></div>
                    <div className="text-xs text-brand-600 font-medium mt-0.5">Abonnement mercredi</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Adhérent AUNL : 5€ / 4€ par sem · Licence FFA +45€ si besoin</p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {[
              { num: '10', label: 'Personnes max / séance' },
              { num: '1h', label: 'Format dense & rythmé' },
              { num: '86%', label: 'Des muscles sollicités' },
              { num: 'FFA', label: 'Labellisé fédération' },
            ].map((s) => (
              <div key={s.num} className="py-7 px-6 text-center">
                <div className="text-4xl font-bold text-brand tracking-tight">{s.num}</div>
                <div className="text-xs text-gray-400 mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FFA BANNER */}
        <div className="bg-brand-50 border-y border-brand-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-brand-700">Programme Avifit® — Fédération Française d&apos;Aviron</div>
              <div className="text-xs text-brand-500">Cours collectifs en musique · Coach diplômé · Plus de 100 clubs en France</div>
            </div>
          </div>
        </div>

        {/* PHOTOS */}
        <section className="bg-gray-50 border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">L&apos;ambiance</p>
            <h2 className="text-4xl font-bold tracking-tight mb-8">À l&apos;AUNL.</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] col-span-2 md:col-span-1 md:row-span-2 md:aspect-auto md:min-h-[400px]">
                <Image src="/photo-unl-seance.jpg" alt="Séance collective sur ergomètre Concept2 — AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-unl-ergo.jpg" alt="Ergomètres Concept2 — AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-ergo-collectif.webp" alt="Séance Avifit collective" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* CONCEPT */}
        <section id="concept" className="bg-white border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
            <div>
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Une séance type</p>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Ce qui vous attend</h2>
              <p className="text-base text-gray-600 leading-relaxed mb-6">Chaque séance est structurée, rythmée par la musique, et adaptée à votre niveau.</p>
              <div className="flex flex-col gap-3">
                {[
                  { time: "10'", name: 'Échauffement', desc: 'Mobilité articulaire, activation musculaire, prise en main ergo' },
                  { time: "35'", name: "Blocs d'effort", desc: 'Alternance ergo / fitness. Intensité progressive, en musique.' },
                  { time: "10'", name: 'Circuit renforcement', desc: 'Gainage, squats, renfo — sur et autour du rameur.' },
                  { time: "5'",  name: 'Retour au calme', desc: 'Étirements guidés, récupération, respiration.' },
                ].map((b) => (
                  <div key={b.name} className="flex items-center gap-4 bg-gray-50 rounded-xl border border-gray-100 p-4 hover:border-brand-200 transition-colors">
                    <span className="text-xl font-semibold text-brand min-w-[48px]">{b.time}</span>
                    <div>
                      <div className="text-sm font-medium mb-0.5">{b.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed font-medium">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pourquoi l&apos;aviron indoor</p>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Un sport vraiment complet</h2>
              <p className="text-base text-gray-600 leading-relaxed mb-6">Sans impact articulaire, accessible dès la première séance, efficace pour tous.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Cardio intense', desc: 'FC élevée sans abîmer les articulations.' },
                  { title: 'Corps entier', desc: 'Jambes, dos, bras, abdos — tout travaille.' },
                  { title: 'Tous niveaux', desc: "Le coach adapte l'intensité à chacun." },
                  { title: 'Zéro impact', desc: 'Idéal pour reprendre le sport.' },
                  { title: 'Motivation', desc: 'Groupe + musique = adhérence longue durée.' },
                  { title: 'Progression', desc: 'Données ergo pour suivre vos progrès.' },
                ].map((b) => (
                  <div key={b.title} className="border-l-[3px] border-brand pl-4 py-3 bg-white rounded-r-lg border border-gray-100">
                    <div className="text-sm font-medium mb-1">{b.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed font-medium">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AUNL CLUB */}
        <section className="relative h-64 md:h-80 overflow-hidden border-y border-gray-200">
          <Image src="/photo-aunl-club.jpg" alt="Aviron Union Nautique de Lyon — bord de Saône" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-10">
            <div>
              <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Le lieu</div>
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">AUNL · Caluire-et-Cuire</h3>
              <p className="text-sm text-gray-600 font-medium">59 quai Clémenceau, Caluire-et-Cuire</p>
            </div>
          </div>
        </section>

        {/* 3 ÉTAPES */}
        <section className="bg-gray-50 border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Réserver</p>
            <h2 className="text-4xl font-bold mb-10 tracking-tight">En 3 étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n: '1', title: 'Choisissez un créneau', desc: 'Planning en temps réel avec les places disponibles. Réservez en 2 minutes.' },
                { n: '2', title: 'Payez en ligne', desc: "Séance à l'unité (10€) ou abonnement mercredi (8€/sem). Paiement sécurisé Stripe. Licence FFA ajoutée si besoin." },
                { n: '3', title: 'Venez transpirer', desc: "Confirmation par email. On vous accueille à l'AUNL — 59 quai Clémenceau, Caluire-et-Cuire. Juste de l'eau à apporter." },
              ].map((s) => (
                <div key={s.n} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-sm font-semibold text-brand mb-4">{s.n}</div>
                  <div className="text-base font-bold mb-2">{s.title}</div>
                  <div className="text-sm text-gray-700 leading-relaxed font-medium">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section id="tarifs" className="bg-white border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Tarifs</p>
            <h2 className="text-4xl font-bold mb-10 tracking-tight">Simple et transparent</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Séance unique', desc: 'Grand public · à la séance', price: '10€', unit: 'par séance',
                  items: ['1 séance 1h', 'Réservation en ligne', 'Confirmation email', 'Licence FFA si besoin (+45€)'],
                  featured: false,
                },
                {
                  name: 'Abonnement mercredi', desc: 'Grand public · place auto chaque semaine', price: '8€', unit: '/ semaine · 1 mois min', href: '/abonnement',
                  items: ['Place réservée automatiquement', 'Prélèvement hebdomadaire', 'Résiliation libre après 1 mois', 'Licence FFA si besoin (+45€)'],
                  featured: true,
                },
                {
                  name: 'Adhérent AUNL', desc: 'Licencié FFA · tarif club', price: '5€', unit: 'par séance (4€/sem en abonnement)',
                  items: ['Licence FFA déjà incluse', 'Tarif automatique à la réservation', 'Séance ou abonnement'],
                  featured: false,
                },
              ].map((p) => (
                <div key={p.name} className={`rounded-2xl p-7 ${p.featured ? 'border-2 border-brand' : 'border border-gray-200'}`}>
                  {p.featured && (
                    <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      Meilleure valeur
                    </span>
                  )}
                  <div className="text-base font-semibold mb-1">{p.name}</div>
                  <div className="text-xs text-gray-400 mb-5">{p.desc}</div>
                  <div className="text-4xl font-bold tracking-tight">{p.price}</div>
                  <div className="text-xs text-gray-400 mt-1 mb-5">{p.unit}</div>
                  <div className="h-px bg-gray-100 mb-5" />
                  <ul className="flex flex-col gap-2.5 mb-6">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={('href' in p && p.href) ? p.href : '/planning'}
                    className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${p.featured ? 'bg-brand text-white hover:bg-brand-700' : 'border border-brand text-brand hover:bg-brand-50'}`}
                  >
                    {('href' in p && p.href) ? "S'abonner" : 'Réserver'}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * Licence FFA annuelle 45€ requise si non-licencié — ajoutée au checkout. Adhérents AUNL : tarif 5€/4€ appliqué automatiquement à la réservation.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand py-20 px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Première séance ?</h2>
          <p className="text-brand-200 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Aucun prérequis. Aucun matériel. Le coach s&apos;adapte à votre niveau dès la première venue.
          </p>
          <Link href="/planning" className="inline-block bg-white text-brand font-semibold px-10 py-4 rounded-xl text-base hover:bg-brand-50 transition-colors">
            Voir les créneaux disponibles
          </Link>
          <p className="text-brand-300 text-xs mt-4">Annulation possible jusqu&apos;à 24h avant la séance</p>
        </section>

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Navigation</div>
                <div className="flex flex-col gap-2">
                  <a href="/planning" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Planning</a>
                  <a href="/abonnement" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Abonnement mercredi</a>
                  <a href="/#tarifs" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Tarifs</a>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mon compte</div>
                <div className="flex flex-col gap-2">
                  <a href="/mon-abonnement" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Mon abonnement</a>
                  <a href="/faq" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">FAQ</a>
                  <a href="/cgv" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">CGV</a>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Aussi par Alexis</div>
                <div className="flex flex-col gap-2">
                  <a href="https://rowning.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">
                    RoWning — Offre entreprise →
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Label</div>
                <div className="text-xs text-gray-500 font-medium">Labellisé Avifit® · FFA<br />Aviron Union Nautique de Lyon</div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 text-xs text-gray-400 text-center">
              © 2025 Alexis Lecointe — Avifit AUNL Lyon
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
