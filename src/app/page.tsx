import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TarifsSection from '@/components/TarifsSection'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function placesTag(max: number, reservees: number) {
  const dispo = max - reservees
  if (dispo === 0) return { label: 'Complet', cls: 'bg-red-100 text-red-700' }
  if (dispo <= 2) return { label: `Plus que ${dispo} place${dispo > 1 ? 's' : ''}`, cls: 'bg-orange-100 text-orange-700' }
  if (dispo <= 4) return { label: `${dispo} places`, cls: 'bg-yellow-100 text-yellow-700' }
  return { label: `${dispo} places`, cls: 'bg-green-100 text-green-700' }
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

        {/* HERO — full bleed */}
        <section className="relative min-h-[100svh] md:min-h-[92vh] flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/photo-unl-seance.jpg" alt="Séance Avifit AUNL" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/20" />
          </div>

          {/* Badge FFA — mobile dans le flux, desktop absolu */}
          <div className="absolute top-6 left-6 md:left-12 hidden md:block">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Labellisé Avifit® · FFA
            </div>
          </div>

          <div className="relative px-4 md:px-12 pb-6 md:pb-16 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">

              <div>
                {/* Badge mobile dans le flux */}
                <div className="md:hidden mb-4">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Labellisé Avifit® · FFA
                  </div>
                </div>
                <h1 className="text-[clamp(52px,8vw,96px)] font-black leading-[0.9] tracking-tight text-white mb-6">
                  L&apos;aviron<br />indoor.<br />
                  <span className="text-brand">Pour tous.</span>
                </h1>
                <p className="text-white/70 text-base leading-relaxed mb-8 max-w-sm">
                  1h sur ergo. 10 personnes max. Coach certifié FFA.<br />Aucun prérequis — aucun matériel.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/planning" className="bg-brand text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand/30">
                    Réserver une séance
                  </Link>
                  <Link href="/abonnement" className="bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                    Formule illimitée — 8€/sem
                  </Link>
                </div>
                <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                  {([['10', 'places max'], ['1h', 'par séance'], ['86%', 'muscles actifs'], ['FFA', 'labellisé']] as const).map(([n, l]) => (
                    <div key={n}>
                      <div className="text-2xl font-black text-white tracking-tight">{n}</div>
                      <div className="text-xs text-white/50 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full" style={{boxShadow:'0 25px 60px rgba(0,0,0,0.35)'}}>

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Prochaines séances</p>
                </div>

                {/* Liste séances */}
                <div className="divide-y divide-gray-100">
                  {prochainesSeances && prochainesSeances.length > 0 ? (
                    prochainesSeances.map((s, i) => {
                      const tag = placesTag(s.places_max, s.places_reservees)
                      const dispo = s.places_max - s.places_reservees
                      const d = new Date(s.date + 'T00:00:00')
                      const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                      const jourCapital = jour.charAt(0).toUpperCase() + jour.slice(1)
                      return (
                        <div key={s.id} className={`flex items-center gap-3 px-5 py-3.5 ${i === 0 ? 'bg-brand-50' : 'hover:bg-gray-50'} transition-colors`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <div className="text-gray-900 font-bold text-sm leading-tight truncate">{jourCapital}</div>
                              {(() => {
                                const tagMap: Record<string, [string, string]> = { generale: ['🏋️ Générale', 'bg-gray-100 text-gray-600'], renfo: ['💪 Renfo', 'bg-orange-100 text-orange-700'], cardio: ['❤️ Cardio', 'bg-red-100 text-red-700'], rowning: ['🚣 Rowning', 'bg-blue-100 text-blue-700'] }
                                const t = (s as unknown as Record<string, unknown>).type_seance as string ?? 'generale'
                                const [label, cls] = tagMap[t] ?? tagMap.generale
                                return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
                              })()}
                            </div>
                            <div className="text-gray-400 text-xs font-medium mt-0.5">{s.heure_debut.slice(0,5)} · 1h</div>
                          </div>
                          {tag && <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${tag.cls}`}>{tag.label}</span>}
                          {dispo > 0 && (
                            <Link href={`/reserver/${s.id}`} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors ${i === 0 ? 'bg-brand text-white hover:bg-brand-700 shadow-sm shadow-brand/30' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                              Réserver
                            </Link>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-6">Aucune séance programmée</p>
                  )}
                </div>

                <Link href="/planning" className="flex items-center justify-center gap-1 text-xs font-bold text-brand hover:text-brand-700 transition-colors py-3.5 border-t border-gray-100 bg-gray-50">
                  Voir tous les créneaux <span>→</span>
                </Link>

                {/* Tarifs */}
                <div className="grid grid-cols-2 border-t-2 border-gray-100">
                  <Link href="/planning" className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 transition-colors border-r-2 border-gray-100">
                    <span className="text-2xl font-black text-gray-900 tracking-tight">10€</span>
                    <span className="text-[11px] text-gray-400 font-semibold mt-0.5">la séance</span>
                  </Link>
                  <Link href="/abonnement" className="flex flex-col items-center justify-center py-4 bg-brand hover:bg-brand-700 transition-colors">
                    <span className="text-2xl font-black text-white tracking-tight">8€<span className="text-sm font-medium opacity-80">/sem</span></span>
                    <span className="text-[11px] text-brand-200 font-bold mt-0.5">Formule illimitée</span>
                  </Link>
                </div>
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

        {/* VIDEO */}
        <section className="bg-gray-950 border-b border-gray-800 py-10 md:py-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">En vrai</p>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-4">À quoi ça ressemble ?</h2>
              <p className="text-base text-gray-400 leading-relaxed">
                Une séance Avifit à l&apos;AUNL — ambiance, intensité, ergos Concept2. Vois par toi-même ce qui t&apos;attend.
              </p>
            </div>
            <div className="w-full md:w-auto flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{width: '315px', height: '560px'}}>
                <iframe
                  src="https://www.youtube.com/embed/NCpQ98vOt0g"
                  title="Séance Avifit AUNL"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{border: 'none'}}
                />
              </div>
            </div>
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
              <div className="text-xs text-brand-500">Séances en musique · Coach diplômé FFA · Plus de 100 clubs en France</div>
            </div>
          </div>
        </div>

        {/* PHOTOS */}
        <section className="bg-gray-50 border-b border-gray-200 py-10 md:py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">L&apos;ambiance</p>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6">À l&apos;AUNL.</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Grande photo à gauche — ergos vue sur la Saône */}
              <div className="relative overflow-hidden rounded-2xl col-span-2 md:col-span-1 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[500px]">
                <Image src="/photo-seance-8.jpg" alt="Ergomètres Concept2 — vue sur la Saône AUNL" fill className="object-cover object-center hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-seance-7.jpg" alt="Séance Avifit AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-seance-1.jpg" alt="Séance Avifit AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-seance-5.jpg" alt="Séance Avifit AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image src="/photo-seance-6.jpg" alt="Séance Avifit AUNL" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* CONCEPT */}
        <section id="concept" className="bg-white border-b border-gray-200 py-10 md:py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
            <div>
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Une séance type</p>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">Ce qui vous attend</h2>
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
              <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">Un sport vraiment complet</h2>
              <p className="text-base text-gray-600 leading-relaxed mb-6">Sans impact articulaire, accessible dès la première séance, efficace pour tous.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Cardio intense', desc: 'FC élevée sans abîmer les articulations.' },
                  { title: 'Corps entier', desc: 'Jambes, dos, bras, abdos — tout travaille.' },
                  { title: 'Tous niveaux', desc: "Le coach adapte l'intensité à chacun." },
                  { title: 'Zéro impact', desc: 'Idéal pour reprendre le sport.' },
                  { title: 'Motivation', desc: 'En groupe et en musique, on revient chaque semaine.' },
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
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">AUNL · Caluire-et-Cuire</h3>
              <p className="text-sm text-gray-600 font-medium mb-4">59 quai Clémenceau, Caluire-et-Cuire</p>
              <a href="https://maps.google.com/?q=59+quai+Clemenceau+Caluire-et-Cuire" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-brand text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                Voir sur Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* 3 ÉTAPES */}
        <section className="bg-gray-50 border-b border-gray-200 py-10 md:py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Réserver</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">En 3 étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n: '1', title: 'Choisissez un créneau', desc: 'Planning en temps réel avec les places disponibles. Réservez en 2 minutes.' },
                { n: '2', title: 'Payez en ligne', desc: "Séance à l'unité (10€) ou formule illimitée (8€/sem). Paiement sécurisé Stripe. Licence FFA ajoutée si besoin." },
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
        <TarifsSection />

        {/* CTA */}
        {/* LES COACHS */}
        <section className="bg-white border-b border-gray-200 py-10 md:py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">L&apos;équipe</p>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Vos coachs</h2>
              <Link href="/planning" className="hidden sm:inline-block bg-brand text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition-colors">
                Réserver ma séance →
              </Link>
            </div>

            {/* Carousel scroll horizontal mobile, grille desktop */}
            <div className="flex gap-5 overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory">

              {/* Alexis — coach principal */}
              <div className="shrink-0 w-64 sm:w-auto snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
                  <Image src="/photo-unl-seance.jpg" alt="Alexis Lecointe" fill className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">Coach principal</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-base">Alexis Lecointe</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">Éducateur Aviron Indoor FFA</div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-[10px] font-semibold bg-brand-50 text-brand px-2 py-0.5 rounded-full">🏅 CQP IF HM</span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🚣 Masters</span>
                  </div>
                </div>
              </div>

              {/* Marie — placeholder */}
              <div className="shrink-0 w-64 sm:w-auto snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src="/photo-coach-marie.jpg" alt="Marie" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-base">Marie D.</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">Coach Avifit</div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🎓 BPJEPS</span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">💪 Cardio</span>
                  </div>
                </div>
              </div>

              {/* Thomas — placeholder */}
              <div className="shrink-0 w-64 sm:w-auto snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src="/photo-coach-thomas.jpg" alt="Thomas" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-base">Thomas K.</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">Coach Avifit</div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🚣 Compétition</span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🏋️ Force</span>
                  </div>
                </div>
              </div>

              {/* Sophie — placeholder */}
              <div className="shrink-0 w-64 sm:w-auto snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src="/photo-coach-sophie.jpg" alt="Sophie" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-base">Sophie M.</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">Coach Avifit</div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🧘 Récup</span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">❤️ Endurance</span>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA mobile */}
            <div className="mt-6 sm:hidden">
              <Link href="/planning" className="block w-full text-center bg-brand text-white font-bold py-4 rounded-xl text-sm hover:bg-brand-700 transition-colors">
                Réserver ma séance →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-brand py-12 md:py-20 px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 tracking-tight">Première séance ?</h2>
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
                  <a href="/abonnement" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Formule illimitée</a>
                  <a href="/#tarifs" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Tarifs</a>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mon compte</div>
                <div className="flex flex-col gap-2">
                  <a href="/mes-seances" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Mes séances</a>
                  <a href="/mon-abonnement" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Ma formule</a>
                  <a href="/faq" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">FAQ</a>
                  <a href="/cgv" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">CGV</a>
                  <a href="/mentions-legales" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Mentions légales</a>
                  <a href="/politique-confidentialite" className="text-xs text-gray-500 hover:text-brand font-medium transition-colors">Confidentialité</a>
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
