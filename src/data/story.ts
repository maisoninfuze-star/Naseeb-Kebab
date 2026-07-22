/**
 * OUR STORY — long-form content.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT IS AND IS NOT CLAIMED HERE
 * ═══════════════════════════════════════════════════════════════════
 * The restaurant has supplied no founder history, no founding date, no family
 * background. NONE of that is invented below.
 *
 * What this page can honestly carry is general Afghan culinary and hospitality
 * tradition — verifiable, widely documented, and true regardless of which
 * family runs which kitchen. Every such passage is written about AFGHAN
 * CULTURE, never as a claim about this restaurant. "Afghan tables are set
 * this way" is supportable; "our grandmother set her table this way" is not,
 * and does not appear.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CULTURAL ACCURACY
 * ═══════════════════════════════════════════════════════════════════
 * The copy speaks about Afghanistan on its OWN terms — Afghan regions, Afghan
 * languages (Dari and Pashto), Afghan ingredients — and does not frame the
 * cuisine as a version of anyone else's. Per the owner: no "Persian", no
 * Iran/Tehran comparisons. Afghan is Afghan. It is also NOT Arab and NOT
 * Indian, which the copy states plainly.
 *
 * Deliberately absent, as orientalist cliché rather than Afghan reality:
 * genie lamps, camels, "Arabian Nights" register, scimitars, Arabic
 * calligraphy as ornament (wrong language family), minaret-and-crescent
 * shorthand, "exotic spice bazaar" copy. The academic name for that failure
 * is gastronomical orientalism, and beyond being inaccurate it reads as fake
 * to the Afghan diaspora audience most likely to become regulars.
 *
 * Sources consulted: Afghan cuisine and Ethnicity in Afghanistan (Wikipedia);
 * Afghan Culture Unveiled on chai and hospitality; Together Women Rise on
 * dastarkhān; Gul (design) on carpet medallions; Afghan Lapis on Sar-e-Sang.
 */

export interface StoryChapter {
  /** Editorial index — 01, 02, 03. */
  n: string
  titleFr: string
  titleEn: string
  bodyFr: string
  bodyEn: string
  /** Frame id from the composited set, or null for a type-only chapter. */
  image: string | null
}

export const CHAPTERS: StoryChapter[] = [
  {
    n: '01',
    titleFr: 'La nappe, posée à même le sol',
    titleEn: 'The cloth, spread on the floor',
    bodyFr:
      'Dans une maison afghane, le repas se pose sur le dastarkhān — une nappe étendue au sol, autour de laquelle tout le monde s’assoit au même niveau. Les plats arrivent au centre et personne ne mange seul dans son assiette. C’est de là que viennent nos grandes assiettes : elles ne sont pas une formule, c’est simplement la façon dont cette cuisine se sert.',
    bodyEn:
      'In an Afghan home the meal is laid on the dastarkhān — a cloth spread on the floor, everyone seated around it at the same height. Dishes arrive in the middle and nobody eats alone off their own plate. That is where our large platters come from: they are not a deal, they are simply how this food is served.',
    image: 'DSC09453',
  },
  {
    n: '02',
    titleFr: 'Le thé avant tout le reste',
    titleEn: 'Tea before anything else',
    bodyFr:
      'On sert le thé dès l’arrivée, quelle que soit l’heure, avant même de demander si l’invité a faim. En dari, on parle de mehmān-nawāzī : recevoir n’est pas une politesse, c’est une obligation, et l’invité passe avant la maison. C’est la partie de la tradition afghane la plus difficile à mettre sur un menu, et c’est celle à laquelle nous tenons le plus.',
    bodyEn:
      'Tea is poured the moment you arrive, whatever the hour, before anyone asks whether you are hungry. In Dari this is mehmān-nawāzī: hosting is not a courtesy but an obligation, and the guest comes before the household. It is the part of Afghan tradition hardest to put on a menu, and the part we care about most.',
    image: null,
  },
  {
    n: '03',
    titleFr: 'Le pain, jamais jeté',
    titleEn: 'Bread, never thrown away',
    bodyFr:
      'Le naan sort du tandoor en quelques minutes : la pâte est plaquée contre la paroi brûlante, elle gonfle, elle prend la marque du feu. Le pain afghan ne se jette pas et ne se pose pas à l’envers — il est traité avec respect. Il arrive à table avec les kababs, les oignons crus et le chutney, et il reste là jusqu’à la fin.',
    bodyEn:
      'Naan comes out of the tandoor in minutes — dough slapped against the burning wall, blistering, taking the mark of the fire. Afghan bread is never thrown away and never set down upside down; it is handled with respect. It arrives with the kababs, the raw onion and the chutney, and it stays on the table until the end.',
    image: 'DSC09513',
  },
  {
    n: '04',
    titleFr: 'La fumée comme ingrédient',
    titleEn: 'Smoke as an ingredient',
    bodyFr:
      'Le charbon de bois n’est pas une méthode de cuisson chez nous, c’est un ingrédient. La viande marine la veille, puis tout se joue en quelques secondes au-dessus des braises : trop tôt et c’est cru, trop tard et c’est perdu. Il n’y a pas de raccourci, et c’est précisément ce qui fait la différence.',
    bodyEn:
      'Charcoal is not a cooking method here, it is an ingredient. The meat marinates overnight, then everything is decided in seconds over the embers: too early and it is raw, too late and it is gone. There is no shortcut, and that is exactly what you taste.',
    image: 'DSC09476',
  },
]

/**
 * Mid-page pull quote.
 *
 * Placed after the hospitality chapter, where the page most needs a change of
 * pace: four chapters of alternating image-and-text becomes a rhythm with no
 * accent. A full-bleed quote is the accent.
 *
 * The line is a plain-language rendering of mehmān-nawāzī, NOT a proverb
 * attributed to anyone. Afghan proverbs exist in abundance, but quoting one
 * without a verifiable source — and without a native speaker checking the
 * transliteration — is exactly the kind of decorative borrowing this project
 * has otherwise avoided.
 */
export const PULL_QUOTE = {
  fr: 'L’invité arrive avec sa propre chance. On ne demande pas s’il a faim — on met la table.',
  en: 'A guest arrives carrying their own good fortune. You do not ask whether they are hungry — you set the table.',
}

/**
 * The blue.
 *
 * Sar-e-Sang in Badakhshan is the historic world source of lapis lazuli — deep
 * ultramarine flecked with gold pyrite, ground into the most expensive pigment
 * in medieval painting. The restaurant's plates happen to be a teal-blue glaze
 * with a gold rim, which lands in that palette by coincidence rather than by
 * design. Worth saying once, quietly, and not labouring.
 */
export const LAPIS = {
  eyebrowFr: 'Le bleu',
  eyebrowEn: 'The blue',
  titleFr: 'Un bleu qui vient de Badakhshan',
  titleEn: 'A blue that comes from Badakhshan',
  bodyFr:
    'Le lapis-lazuli est extrait depuis des millénaires à Sar-e-Sang, dans le nord-est de l’Afghanistan — un bleu profond piqué d’or, longtemps le pigment le plus cher de la peinture. Nos assiettes ne prétendent pas à cette histoire. Mais le bleu et l’or, sur une table afghane, ne sont pas un hasard de décoration.',
  bodyEn:
    'Lapis lazuli has been mined for millennia at Sar-e-Sang in north-eastern Afghanistan — a deep blue flecked with gold, and for centuries the most costly pigment in painting. Our plates make no claim to that history. But blue and gold, on an Afghan table, are not a decorating accident.',
}

/**
 * Fields the restaurant must supply. Each maps to an admin dashboard field.
 * A page that says "your story goes here" is worth more than a page of
 * invented heritage the owner then has to disown.
 */
export const OWNER_FIELDS = [
  { key: 'founding', fr: 'L’histoire de la fondation', en: 'The founding story' },
  { key: 'family', fr: 'La famille derrière le restaurant', en: 'The family behind the restaurant' },
  { key: 'naseeb', fr: 'La signification du nom « Naseeb »', en: 'What the name “Naseeb” means' },
  { key: 'afghanistan', fr: 'Le lien avec l’Afghanistan', en: 'The connection to Afghanistan' },
  { key: 'opening', fr: 'La date d’ouverture', en: 'The opening date' },
]
