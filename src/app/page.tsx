import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="bg-white border-b border-gray-200 py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-200 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                Labellisé Avifit® · Fédération Française d&apos;Aviron
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-5">
                L&apos;aviron indoor<br />
                pour <span className="text-brand">tout le monde.</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 max-w-md">
                Cours collectifs sur ergomètre, 1h, 10 personnes max. Encadré par un coach certifié FFA. Aucun prérequis — aucun matériel.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/planning" className="bg-brand text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors">
                  Voir le planning
                </Link>
                <a href="#concept" className="border border-brand text-brand text-sm font-medium px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
                  En savoir plus
                </a>
              </div>
            </div>

            {/* Planning widget */}
            <div className="bg-brand-50 rounded-2xl border border-brand-200 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Prochaines séances</p>
              {[
                { titre: 'Avifit — Débutant', jour: 'Mardi 19h00', tag: '3 places', tagClass: 'bg-green-100 text-green-700', pct: 70 },
                { titre: 'Avifit — Intermédiaire', jour: 'Jeudi 18h30', tag: '2 places', tagClass: 'bg-yellow-100 text-yellow-700', pct: 80 },
                { titre: 'Avifit — Tous niveaux', jour: 'Samedi 10h00', tag: 'Complet', tagClass: 'bg-red-100 text-red-700', pct: 100 },
              ].map((s) => (
                <div key={s.titre} className="bg-white rounded-xl border border-gray-100 p-4 mb-3 last:mb-0 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{s.titre}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.tagClass}`}>{s.tag}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mb-2">
                    <span>{s.jour}</span><span>1h · 10 pers max</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
              <Link href="/planning" className="block mt-4 text-center text-sm font-medium text-brand hover:underline">
                Voir tous les créneaux →
              </Link>
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

        {/* PHOTOS UNL */}
        <section className="bg-gray-50 border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">L&apos;ambiance</p>
            <h2 className="text-4xl font-bold tracking-tight mb-8">À l&apos;Union Nautique de Lyon.</h2>
            <div className="grid grid-cols-2 gap-3" style={{ height: '480px' }}>
              <div className="overflow-hidden rounded-2xl row-span-2">
                <img src="/photo-unl-seance.jpg" alt="Séance Avifit UNL Lyon — ergomètres Concept2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="grid grid-rows-2 gap-3 h-full">
                <div className="overflow-hidden rounded-2xl">
                  <img src="/photo-unl-coach.jpg" alt="Coach Avifit UNL Lyon"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img src="/photo-unl-salle.jpg" alt="Salle ergomètres UNL Lyon"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
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

        {/* 3 ÉTAPES */}
        <section className="bg-gray-50 border-b border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Réserver</p>
            <h2 className="text-4xl font-bold mb-10 tracking-tight">En 3 étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n: '1', title: 'Choisissez un créneau', desc: 'Planning en temps réel avec les places disponibles. Débutant, intermédiaire ou tous niveaux.' },
                { n: '2', title: 'Payez en ligne', desc: "Séance à l'unité (10€) ou forfait 10 séances (80€). Paiement sécurisé Stripe. Licence FFA ajoutée si besoin." },
                { n: '3', title: 'Venez transpirer', desc: "Confirmation par email. On vous accueille à l'UNL bord de Saône. Juste de l'eau à apporter." },
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
                  name: 'Séance', desc: "Grand public · à l'unité", price: '10€', unit: 'par séance',
                  items: ['1 séance 1h', 'Réservation en ligne', 'Confirmation email', 'Licence FFA si besoin (+45€)'],
                  featured: false,
                },
                {
                  name: 'Forfait 10 séances', desc: 'Grand public · le plus populaire', price: '80€', unit: 'soit 8€ / séance',
                  items: ['10 séances au choix', 'Valable 3 mois', 'Réservation flexible', 'Licence FFA si besoin (+45€)'],
                  featured: true,
                },
                {
                  name: 'Licencié UNL', desc: 'Déjà licencié FFA · tarif adhérent', price: '8€', unit: 'par séance',
                  items: ['Licence FFA déjà incluse', 'Priorité sur les créneaux', 'Forfait 10 séances à 70€'],
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
                    href="/planning"
                    className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${p.featured ? 'bg-brand text-white hover:bg-brand-700' : 'border border-brand text-brand hover:bg-brand-50'}`}
                  >
                    Réserver
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * Licence FFA annuelle 45€ requise si non-licencié — ajoutée automatiquement au checkout. Licenciés UNL : déjà couverts.
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
        <footer className="bg-white border-t border-gray-200 px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            <span className="text-xs text-gray-400">© 2025 Union Nautique de Lyon — Avifit</span>
            <span className="text-xs text-gray-400">Labellisé Avifit® · Fédération Française d&apos;Aviron</span>
          </div>
        </footer>

      </main>
    </>
  )
}
