import Navbar from '@/components/Navbar'

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mentions légales</h1>
          <p className="text-sm text-gray-400 font-medium mb-10">Conformément à la loi n°2004-575 du 21 juin 2004 (LCEN)</p>

          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col gap-8">

            <section>
              <h2 className="text-base font-bold mb-3">Éditeur du site</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p><strong>Responsable :</strong> Alexis Lecointe</p>
                <p><strong>Activité :</strong> Coach sportif — séances Avifit labellisées FFA</p>
                <p><strong>Adresse :</strong> AUNL, 59 quai Clémenceau, 69300 Caluire-et-Cuire</p>
                <p><strong>Contact :</strong> via le formulaire de contact du site</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">Hébergeur</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                <p><strong>Société :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
                <p><strong>Site :</strong> vercel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">Propriété intellectuelle</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                L&apos;ensemble du contenu de ce site (textes, images, visuels) est la propriété d&apos;Alexis Lecointe et de l&apos;AUNL. Toute reproduction, même partielle, est interdite sans autorisation préalable.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">Paiement</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Les paiements en ligne sont traités par <strong>Stripe Inc.</strong>, prestataire de paiement sécurisé. Aucune donnée bancaire n&apos;est stockée sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">Données personnelles</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Voir notre <a href="/politique-confidentialite" className="text-brand hover:underline font-medium">Politique de confidentialité</a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3">Cookies</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement (authentification, session). Aucun cookie publicitaire ou de tracking n&apos;est utilisé. Le stockage local (localStorage) peut être utilisé pour mémoriser vos préférences de réservation, avec votre consentement explicite.
              </p>
            </section>

          </div>
        </div>
      </main>
    </>
  )
}
