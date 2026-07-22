import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { CONFIRMED } from '@/data/site'
import PageHeader from '@/components/ui/PageHeader'
import Prose from '@/components/ui/Prose'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'fr' ? 'Conditions d’utilisation' : 'Terms of Use' }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const fr = locale === 'fr'

  return (
    <>
      <PageHeader
        eyebrow={fr ? 'Légal' : 'Legal'}
        title={fr ? 'Conditions d’utilisation' : 'Terms of Use'}
      />

      <Prose>
        {fr ? (
          <>
            <p className="lede">
              En utilisant ce site, vous acceptez les conditions ci-dessous.
            </p>

            <h2>Le menu et les prix</h2>
            <p>
              Les plats et les prix affichés reflètent le menu au moment de la mise en ligne.
              Ils peuvent changer sans préavis, et la disponibilité varie selon l’arrivage.
              En cas de divergence, le menu affiché au restaurant fait foi.
            </p>

            <h2>Les photographies</h2>
            <p>
              Les photographies présentent les plats réellement servis au restaurant. La
              présentation peut varier d’une assiette à l’autre. Certaines associations
              photo-plat sont en cours de validation par le restaurant.
            </p>

            <h2>Allergies et intolérances</h2>
            <p>
              Notre cuisine manipule des noix, des produits laitiers, du gluten et d’autres
              allergènes. Nous ne pouvons garantir l’absence de contamination croisée. Si vous
              avez une allergie, <strong>parlez-en directement au personnel avant de
              commander</strong> — ne vous fiez pas uniquement à ce site.
            </p>

            <h2>Demandes de traiteur</h2>
            <p>
              L’envoi du formulaire constitue une demande, non une réservation. Une commande
              n’est confirmée qu’après échange direct avec le restaurant.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              Le nom, le logo, les textes et les photographies de Naseeb Kabab appartiennent
              au restaurant et ne peuvent être reproduits sans autorisation.
            </p>

            <h2>Liens externes</h2>
            <p>
              Ce site peut renvoyer vers des services tiers (cartes, plateformes de commande).
              Nous ne contrôlons pas leur contenu ni leurs pratiques de confidentialité.
            </p>

            <h2>Droit applicable</h2>
            <p>
              Ces conditions sont régies par les lois du Québec et du Canada.
            </p>

            <h2>Nous joindre</h2>
            <address>
              {CONFIRMED.name}
              <br />
              {CONFIRMED.address.street}, {CONFIRMED.address.city},{' '}
              {CONFIRMED.address.province} {CONFIRMED.address.postal}
              <br />
              <a href={`tel:${CONFIRMED.phone}`}>{CONFIRMED.phoneDisplay}</a>
            </address>
          </>
        ) : (
          <>
            <p className="lede">By using this website, you agree to the terms below.</p>

            <h2>Menu and prices</h2>
            <p>
              The dishes and prices shown reflect the menu at the time of publication. They
              may change without notice, and availability varies with supply. Where the two
              differ, the menu displayed in the restaurant governs.
            </p>

            <h2>Photography</h2>
            <p>
              The photographs show dishes actually served at the restaurant. Plating varies
              from one serving to the next. Some photo-to-dish matches are still being
              verified by the restaurant.
            </p>

            <h2>Allergies and intolerances</h2>
            <p>
              Our kitchen handles nuts, dairy, gluten and other allergens. We cannot guarantee
              the absence of cross-contamination. If you have an allergy,{' '}
              <strong>speak to staff directly before ordering</strong> — do not rely on this
              website alone.
            </p>

            <h2>Catering enquiries</h2>
            <p>
              Submitting the form is an enquiry, not a booking. An order is confirmed only
              after speaking with the restaurant directly.
            </p>

            <h2>Intellectual property</h2>
            <p>
              The Naseeb Kabab name, logo, text and photographs belong to the restaurant and
              may not be reproduced without permission.
            </p>

            <h2>External links</h2>
            <p>
              This site may link to third-party services (maps, ordering platforms). We do not
              control their content or their privacy practices.
            </p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of Québec and Canada.</p>

            <h2>Contact</h2>
            <address>
              {CONFIRMED.name}
              <br />
              {CONFIRMED.address.street}, {CONFIRMED.address.city},{' '}
              {CONFIRMED.address.province} {CONFIRMED.address.postal}
              <br />
              <a href={`tel:${CONFIRMED.phone}`}>{CONFIRMED.phoneDisplay}</a>
            </address>
          </>
        )}
      </Prose>
    </>
  )
}
