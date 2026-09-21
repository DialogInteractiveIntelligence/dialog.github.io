/**
 * Site-wide settings. This is the first file to edit.
 *
 * Everything here feeds the header, footer, <title> tags, Open Graph cards,
 * JSON-LD structured data, RSS feed and llms.txt, so keep it accurate.
 */
export const site = {
  /** Full group name, used in titles and structured data. */
  name: 'DIALOG',
  /** Short name used in the header wordmark and "Page · Short" titles. */
  shortName: 'DIALOG',
  /** One sentence shown under the group photo and used as the default meta description. */
  tagline: 'A research group studying dialogue, interaction, and intelligent systems that collaborate with people.',
  /** Two or three sentences of introduction shown on the homepage. Plain text or simple HTML. */
  about:
    'We build and study interactive intelligent systems: how they understand people, how people understand them, and how the two adapt to each other over time. Our work combines machine learning, human–computer interaction, and empirical studies with real users.',

  /** Parent institution, used in the footer and as `parentOrganization` in JSON-LD. */
  institution: {
    name: 'Interactive Intelligence, Delft University of Technology',
    // shortName: 'TU Delft',
    // url: 'https://www.tudelft.nl/',
    // department: 'Intelligent Systems, Faculty of EEMCS',
  },

  /** Postal address (shown in footer and JSON-LD). Leave fields empty to hide them. */
  address: {
    street: '1',
    postalCode: '2',
    city: 'j3',
    country: '4',
    countryCode: '5',
  },

  /** General contact email shown in the footer. */
  email: 'info@example.org',

  /** External profiles. Remove any you do not use. */
  social: {
    github: 'https://github.com/DialogInteractiveIntelligence',
    scholar: '',
    linkedin: '',
    bluesky: '',
    x: '',
    youtube: '',
  },

  /** Language of the site content. */
  locale: 'en',

  /** Research areas, used as keywords for search engines and in llms.txt. */
  keywords: [
    'dialogue systems',
    'human-AI interaction',
    'interactive intelligence',
    'machine learning',
    'natural language processing',
  ],

  /** Group photo caption on the homepage (also used as alt text). */
  groupPhotoAlt: 'The group photographed together outside the faculty building.',

  /** Header navigation. Paths are relative to the site base. */
  nav: [
    { label: 'People', href: '/people/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Publications', href: '/publications/' },
    { label: 'News', href: '/news/' },
  ],
} as const;

export type SiteConfig = typeof site;
