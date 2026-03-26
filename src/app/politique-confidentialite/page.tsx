import Navbar from '@/components/Navbar'

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400 font-medium mb-10">Dernière mise à jour : mars 2026 — Conformément au RGPD (UE) 2016/679</p>

          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col gap-8">

            <section>
              <h2 className="text-base font-bold mb-3">1. Responsable du traitement</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Alexis Lecointe, coach sportif à l&apos;AUNL, 59 quai Clémenceau, 69300 Caluire-et-Cuire. Contact via le formulaire du site.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">2. Données collectées</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                <p><strong>Lors d&apos;une réservation :</strong> nom, prénom, adresse email, montant payé.</p>
                <p><strong>Lors d&apos;un paiement :</strong> les données bancaires sont traitées directement par Stripe et ne sont jamais stockées sur notre site.</p>
                <p><strong>Mémorisation locale (optionnel) :</strong> avec votre consentement, nom, prénom, email et préférence licence sont stockés dans le localStorage de votre navigateur pour faciliter vos prochaines réservations. Ces données ne quittent jamais votre appareil.</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">3. Finalités du traitement</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>• Gestion des réservations et confirmation par email</p>
                <p>• Rappels de séances (email automatique 24h avant)</p>
                <p>• Gestion de votre formule illimitée</p>
                <p>• Facturation et comptabilité (obligation légale)</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">4. Base légale</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>• <strong>Exécution du contrat :</strong> réservation, paiement, confirmation</p>
                <p>• <strong>Obligation légale :</strong> conservation des données de facturation</p>
                <p>• <strong>Consentement :</strong> mémorisation locale de vos préférences</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">5. Durée de conservation</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>• Données de réservation : 3 ans à compter de la dernière réservation</p>
                <p>• Données de facturation : 10 ans (obligation légale comptable)</p>
                <p>• Mémorisation locale : jusqu&apos;à suppression par l&apos;utilisateur</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">6. Partage des données</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>Vos données peuvent être transmises à :</p>
                <p>• <strong>Stripe Inc.</strong> — traitement du paiement (États-Unis, clauses contractuelles types UE)</p>
                <p>• <strong>Resend Inc.</strong> — envoi d&apos;emails de confirmation (États-Unis, clauses contractuelles types UE)</p>
                <p>• <strong>Supabase Inc.</strong> — hébergement de la base de données (États-Unis, clauses contractuelles types UE)</p>
                <p>Aucune donnée n&apos;est vendue ou partagée à des fins commerciales.</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">7. Cookies et stockage local</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                <p><strong>Cookies strictement nécessaires (sans consentement) :</strong></p>
                <p>• <code className="bg-gray-100 px-1 rounded text-xs">avifit_admin</code> — session administrateur (httpOnly, 7 jours)</p>
                <p>• <code className="bg-gray-100 px-1 rounded text-xs">avifit_coach</code> — session coach (httpOnly, 7 jours)</p>
                <p className="mt-2"><strong>Stockage local (avec consentement) :</strong></p>
                <p>• <code className="bg-gray-100 px-1 rounded text-xs">avifit_user</code> — préférences de réservation (nom, email, licence). Stocké uniquement sur votre appareil, jamais transmis à nos serveurs sans réservation.</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">8. Vos droits</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p>• <strong>Accès</strong> — obtenir une copie de vos données</p>
                <p>• <strong>Rectification</strong> — corriger des données inexactes</p>
                <p>• <strong>Suppression</strong> — demander l&apos;effacement de vos données</p>
                <p>• <strong>Opposition</strong> — vous opposer à un traitement</p>
                <p>• <strong>Portabilité</strong> — recevoir vos données dans un format structuré</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">
                Pour exercer ces droits : contactez-nous via le formulaire du site. Réponse sous 30 jours.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                En cas de litige, vous pouvez saisir la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">cnil.fr</a>
              </p>
            </section>

          </div>
        </div>
      </main>
    </>
  )
}
