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
  return {
    title: locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy',
    robots: { index: true, follow: true },
  }
}

/**
 * Privacy policy, written against what this site ACTUALLY does:
 * one contact form, no cookies, no advertising trackers, no accounts.
 *
 * Québec's Law 25 requires naming a person responsible for privacy — that is
 * left as an explicit blank for the restaurant to fill rather than invented.
 */
export default async function PrivacyPage({
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
        title={fr ? 'Politique de confidentialité' : 'Privacy Policy'}
      />

      <Prose>
        {fr ? (
          <>
            <p className="lede">
              Cette politique explique quels renseignements personnels Naseeb Kabab recueille
              par l’entremise de ce site web, pourquoi, et ce que vous pouvez exiger. Elle est
              rédigée conformément à la <em>Loi 25</em> du Québec.
            </p>

            <h2>Ce que nous recueillons</h2>
            <p>
              Uniquement ce que vous nous transmettez volontairement dans le formulaire de
              demande : votre nom, votre numéro de téléphone, votre adresse courriel et, si
              vous les fournissez, la date de l’événement, le nombre de personnes, l’occasion
              et votre message.
            </p>
            <p>
              Ce site n’utilise aucun témoin (cookie) publicitaire, aucun pixel de suivi et
              aucun outil de profilage. Nous ne recueillons pas votre adresse IP à des fins
              de marketing et nous ne créons aucun profil de visiteur.
            </p>

            <h2>Pourquoi nous les recueillons</h2>
            <p>
              Pour répondre à votre demande — vous rappeler, préparer une proposition de
              traiteur, confirmer une réservation de groupe. Rien d’autre.
            </p>

            <h2>Ce que nous ne faisons pas</h2>
            <ul>
              <li>Nous ne vendons jamais vos renseignements.</li>
              <li>Nous ne les communiquons à aucun tiers à des fins commerciales.</li>
              <li>Nous ne vous inscrivons à aucune liste d’envoi sans votre consentement.</li>
            </ul>

            <h2>Conservation</h2>
            <p>
              Les demandes sont conservées le temps nécessaire au suivi, puis supprimées.
              Vous pouvez demander la suppression de vos renseignements à tout moment.
            </p>

            <h2>Hébergement</h2>
            <p>
              Les demandes sont stockées chez notre fournisseur d’infonuagique. Selon la
              configuration retenue, ces données peuvent être hébergées à l’extérieur du
              Québec. <strong>[À confirmer par le restaurant : région d’hébergement.]</strong>
            </p>

            <h2>Vos droits</h2>
            <p>
              Vous pouvez demander l’accès, la rectification ou la suppression de vos
              renseignements, ainsi que le retrait de votre consentement, en écrivant à{' '}
              <a href={`mailto:${CONFIRMED.email}`}>{CONFIRMED.email}</a> ou en téléphonant
              au <a href={`tel:${CONFIRMED.phone}`}>{CONFIRMED.phoneDisplay}</a>.
            </p>

            <h2>Responsable de la protection des renseignements personnels</h2>
            <p>
              <strong>[À compléter par le restaurant : nom et coordonnées de la personne
              responsable, tel qu’exigé par la Loi 25.]</strong>
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
            <p className="lede">
              This policy explains what personal information Naseeb Kabab collects through
              this website, why, and what you can ask us to do about it. It is written to
              meet Québec’s <em>Law 25</em>.
            </p>

            <h2>What we collect</h2>
            <p>
              Only what you choose to type into the enquiry form: your name, phone number and
              email address, plus — if you provide them — the event date, number of guests,
              occasion and your message.
            </p>
            <p>
              This site sets no advertising cookies, no tracking pixels and no profiling
              tools. We do not collect your IP address for marketing and we build no visitor
              profile.
            </p>

            <h2>Why we collect it</h2>
            <p>
              To answer your enquiry — to call you back, put together a catering proposal, or
              confirm a group booking. Nothing else.
            </p>

            <h2>What we don’t do</h2>
            <ul>
              <li>We never sell your information.</li>
              <li>We don’t share it with third parties for commercial purposes.</li>
              <li>We don’t add you to any mailing list without your consent.</li>
            </ul>

            <h2>Retention</h2>
            <p>
              Enquiries are kept for as long as needed to follow up, then deleted. You can ask
              us to delete your information at any time.
            </p>

            <h2>Hosting</h2>
            <p>
              Enquiries are stored with our cloud provider. Depending on the configuration
              chosen, that data may be hosted outside Québec.{' '}
              <strong>[To be confirmed by the restaurant: hosting region.]</strong>
            </p>

            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your information, and
              withdraw your consent, by writing to{' '}
              <a href={`mailto:${CONFIRMED.email}`}>{CONFIRMED.email}</a> or calling{' '}
              <a href={`tel:${CONFIRMED.phone}`}>{CONFIRMED.phoneDisplay}</a>.
            </p>

            <h2>Privacy officer</h2>
            <p>
              <strong>[To be completed by the restaurant: name and contact details of the
              person responsible for privacy, as required by Law 25.]</strong>
            </p>

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
