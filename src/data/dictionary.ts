/**
 * NASEEB KABAB — bilingual copy.
 *
 * French is written natively for a Québec audience, not translated from the
 * English. Where a phrase would read as a calque ("un voyage culinaire"),
 * the French says something different rather than something literal.
 *
 * Every string here is brand copy. NO dish name, price or description lives
 * in this file — those come from `menu.ts`, which mirrors the real menu.
 */

export type Locale = 'fr' | 'en'
export const LOCALES: Locale[] = ['fr', 'en']
export const DEFAULT_LOCALE: Locale = 'fr' // Laval, QC — French first.

export const dict = {
  fr: {
    nav: {
      menuButton: 'Menu',
      close: 'Fermer',
      home: 'Accueil',
      story: 'Notre histoire',
      fullMenu: 'Le menu',
      grill: 'Kababs et grillades',
      platters: 'Plats à partager',
      catering: 'Traiteur et événements',
      cateringShort: 'Traiteur',
      gallery: 'Galerie',
      visit: 'Nous trouver',
      order: 'Commander',
      orderOnline: 'Commander en ligne',
      language: 'Langue',
      skipToContent: 'Aller au contenu principal',
      openMenu: 'Ouvrir le menu de navigation',
      closeMenu: 'Fermer le menu de navigation',
    },
    hero: {
      eyebrow: 'Cuisine afghane authentique',
      headline: ['Rassemblez-vous', 'autour du feu.'],
      support:
        'Des plats afghans traditionnels, des kababs grillés sur charbon de bois et de grandes assiettes faites pour être partagées.',
      cta: 'Voir le menu',
      ctaSecondary: 'Commander',
      tertiary: 'Organiser un repas de groupe',
      scroll: 'Défiler',
    },
    statement: {
      quote:
        'Naseeb est un lieu de rencontre : la saveur afghane, les grandes tablées, et la chaleur du charbon de bois.',
      sub: 'Des recettes enracinées dans la tradition. Une cuisine faite pour rassembler.',
    },
    signature: {
      eyebrow: 'Nos incontournables',
      title: 'Ce pour quoi on revient',
      viewMenu: 'Voir le menu complet',
      dish: 'Plat',
    },
    charcoal: {
      title: ['Grillé sur charbon de bois.', 'Servi sans raccourcis.'],
      chapters: [
        {
          n: '01',
          title: 'La marinade',
          body: 'Des épices en couches et une préparation patiente. La viande repose la veille — c’est ce temps-là qui fait la différence.',
        },
        {
          n: '02',
          title: 'Le charbon',
          body: 'Chaleur directe, fumée, et une question de secondes. Le gril ne pardonne pas l’inattention.',
        },
        {
          n: '03',
          title: 'La table',
          body: 'Servi généreusement, avec du riz, du naan et l’hospitalité qui va avec.',
        },
      ],
    },
    classics: {
      eyebrow: 'Les classiques',
      title: 'Ce que la cuisine afghane fait mieux que personne',
      body: 'Le yogourt et la menthe séchée. La sauce tomate parfumée. Le riz, les raisins secs et les carottes. Le pain, toujours au centre de la table.',
    },
    platters: {
      eyebrow: 'Plats à partager',
      title: 'Amenez tout le monde à table.',
      support:
        'De grandes assiettes afghanes préparées pour les familles, les amis et les célébrations.',
      explore: 'Découvrir les plats à partager',
      orderGroup: 'Commander pour un groupe',
      cateringCta: 'Demande de traiteur',
      contentsPending:
        'Le contenu exact de cette assiette sera confirmé par le restaurant.',
      askUs: 'Appelez-nous pour le détail',
    },
    preview: {
      eyebrow: 'Le menu',
      title: 'Un aperçu',
      viewFull: 'Voir le menu complet',
    },
    story: {
      eyebrow: 'Notre histoire',
      title: [
        'Une lettre d’amour à l’Afghanistan,',
        'écrite dans la fumée, les épices',
        'et l’hospitalité.',
      ],
      placeholder:
        'Cette section attend les mots du restaurant : l’histoire de la famille, la signification du nom Naseeb, et ce qui a mené cette cuisine jusqu’à Laval.',
      placeholderNote: 'Contenu à fournir par le restaurant',
    },
    catering: {
      eyebrow: 'Traiteur et événements',
      title: 'Les célébrations sont plus chaleureuses autour de notre table.',
      support:
        'Anniversaires, réunions de famille, repas d’entreprise, grandes commandes et célébrations.',
      cta: 'Planifier votre événement',
      services: [
        'Anniversaires',
        'Réunions de famille',
        'Repas d’entreprise',
        'Service traiteur',
        'Grandes commandes',
        'Célébrations',
      ],
      form: {
        name: 'Nom',
        phone: 'Téléphone',
        email: 'Courriel',
        date: 'Date de l’événement',
        guests: 'Nombre de personnes',
        occasion: 'Occasion',
        type: 'Traiteur ou sur place',
        typeCatering: 'Traiteur',
        typeVenue: 'Au restaurant',
        message: 'Message',
        submit: 'Envoyer la demande',
        sending: 'Envoi…',
        success: 'Merci. Nous vous répondrons rapidement.',
        error: 'Un problème est survenu. Appelez-nous et nous réglerons ça.',
        required: 'Ce champ est requis',
        invalidEmail: 'Adresse courriel invalide',
        optional: 'facultatif',
      },
    },
    reviews: {
      eyebrow: 'Avis',
      title: 'Ce qu’on dit de nous',
      empty:
        'Les avis Google seront affichés ici une fois l’intégration activée.',
    },
    visit: {
      eyebrow: 'Nous trouver',
      title: 'Passez nous voir.',
      address: 'Adresse',
      phone: 'Téléphone',
      hours: 'Heures d’ouverture',
      hoursPending: 'Heures à confirmer — appelez-nous',
      directions: 'Itinéraire',
      viewMap: 'Voir sur la carte',
      call: 'Appeler',
      parking: 'Stationnement',
    },
    footer: {
      statement:
        'Cuisine afghane, grillée sur charbon de bois et servie généreusement. À Laval.',
      explore: 'Explorer',
      contact: 'Nous joindre',
      follow: 'Nous suivre',
      legal: 'Légal',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions d’utilisation',
      rights: 'Tous droits réservés.',
      builtNote: 'Propulsé par B12 Ventures',
    },
    common: {
      from: 'à partir de',
      price: 'Prix',
      unavailable: 'Non disponible',
      vegetarian: 'Végétarien',
      loading: 'Chargement…',
      search: 'Rechercher un plat',
      noResults: 'Aucun plat ne correspond à cette recherche.',
      allCategories: 'Tout',
      backToTop: 'Haut de page',
      photoPending: 'Photo à venir',
    },
  },

  en: {
    nav: {
      menuButton: 'Menu',
      close: 'Close',
      home: 'Home',
      story: 'Our Story',
      fullMenu: 'Menu',
      grill: 'Kababs & Grill',
      platters: 'Sharing Platters',
      catering: 'Catering & Events',
      cateringShort: 'Catering',
      gallery: 'Gallery',
      visit: 'Visit Us',
      order: 'Order',
      orderOnline: 'Order Online',
      language: 'Language',
      skipToContent: 'Skip to main content',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
    hero: {
      eyebrow: 'Authentic Afghan cuisine',
      headline: ['Gather around', 'the fire.'],
      support:
        'Traditional Afghan dishes, charcoal-grilled kababs and generous platters made to be shared.',
      cta: 'View the Menu',
      ctaSecondary: 'Order Online',
      tertiary: 'Plan a group dinner',
      scroll: 'Scroll',
    },
    statement: {
      quote:
        'Naseeb is a meeting place for Afghan flavour, generous tables and the warmth of charcoal fire.',
      sub: 'Recipes rooted in tradition. Food made to bring people together.',
    },
    signature: {
      eyebrow: 'Signature dishes',
      title: 'What people come back for',
      viewMenu: 'View the full menu',
      dish: 'Dish',
    },
    charcoal: {
      title: ['Grilled over charcoal.', 'Served without shortcuts.'],
      chapters: [
        {
          n: '01',
          title: 'The Marinade',
          body: 'Layered spices and patient preparation. The meat rests overnight — that waiting is the whole point.',
        },
        {
          n: '02',
          title: 'The Charcoal',
          body: 'Direct heat, smoke, and a matter of seconds. The grill does not forgive a wandering eye.',
        },
        {
          n: '03',
          title: 'The Table',
          body: 'Served generously, with rice, naan and the hospitality that comes with it.',
        },
      ],
    },
    classics: {
      eyebrow: 'Afghan classics',
      title: 'What this kitchen does better than anyone',
      body: 'Yogurt and dried mint. Fragrant tomato sauce. Rice with raisins and carrots. Bread, always at the centre of the table.',
    },
    platters: {
      eyebrow: 'Sharing platters',
      title: 'Bring everyone to the table.',
      support:
        'Generous Afghan platters prepared for families, friends and celebrations.',
      explore: 'Explore sharing platters',
      orderGroup: 'Order for a group',
      cateringCta: 'Catering inquiry',
      contentsPending:
        'The exact contents of this platter will be confirmed by the restaurant.',
      askUs: 'Call us for the details',
    },
    preview: {
      eyebrow: 'The menu',
      title: 'A first look',
      viewFull: 'View the full menu',
    },
    story: {
      eyebrow: 'Our story',
      title: [
        'A love letter to Afghanistan,',
        'written in smoke, spice',
        'and hospitality.',
      ],
      placeholder:
        'This section is waiting on the restaurant’s own words: the family story, what the name Naseeb means, and how this kitchen made its way to Laval.',
      placeholderNote: 'Content to be supplied by the restaurant',
    },
    catering: {
      eyebrow: 'Catering & events',
      title: 'Celebrations feel warmer around our table.',
      support:
        'Birthdays, family gatherings, corporate meals, large group orders and celebrations.',
      cta: 'Plan your event',
      services: [
        'Birthdays',
        'Family gatherings',
        'Corporate meals',
        'Catering',
        'Large group orders',
        'Celebrations',
      ],
      form: {
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        date: 'Event date',
        guests: 'Number of guests',
        occasion: 'Occasion',
        type: 'Catering or in-restaurant',
        typeCatering: 'Catering',
        typeVenue: 'In-restaurant',
        message: 'Message',
        submit: 'Send inquiry',
        sending: 'Sending…',
        success: 'Thank you. We’ll get back to you shortly.',
        error: 'Something went wrong. Call us and we’ll sort it out.',
        required: 'This field is required',
        invalidEmail: 'Invalid email address',
        optional: 'optional',
      },
    },
    reviews: {
      eyebrow: 'Reviews',
      title: 'What people say',
      empty: 'Google reviews will appear here once the integration is enabled.',
    },
    visit: {
      eyebrow: 'Visit us',
      title: 'Come and see us.',
      address: 'Address',
      phone: 'Phone',
      hours: 'Opening hours',
      hoursPending: 'Hours to be confirmed — give us a call',
      directions: 'Directions',
      viewMap: 'View on map',
      call: 'Call',
      parking: 'Parking',
    },
    footer: {
      statement:
        'Afghan cooking, grilled over charcoal and served generously. In Laval.',
      explore: 'Explore',
      contact: 'Contact',
      follow: 'Follow',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      rights: 'All rights reserved.',
      builtNote: 'Powered by B12 Ventures',
    },
    common: {
      from: 'from',
      price: 'Price',
      unavailable: 'Unavailable',
      vegetarian: 'Vegetarian',
      loading: 'Loading…',
      search: 'Search the menu',
      noResults: 'No dishes match that search.',
      allCategories: 'All',
      backToTop: 'Back to top',
      photoPending: 'Photo to come',
    },
  },
} as const

export type Dict = (typeof dict)['fr']
export const getDict = (locale: Locale): Dict => dict[locale] as Dict
