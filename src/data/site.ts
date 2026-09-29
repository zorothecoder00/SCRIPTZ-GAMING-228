// Infos fixes de l'équipe — à compléter. Les champs vides sont simplement masqués sur le site.
// (Joueurs, palmarès, actus et partenaires se gèrent depuis /admin.)
export const site = {
  name: 'Scriptz Gaming 228',
  shortName: 'SCRIPTZ',
  tag: '228',
  tagline: 'Équipe esport togolaise',
  description: "Scriptz Gaming 228 — équipe esport togolaise. Découvre nos joueurs, notre palmarès et nos actualités.",
  country: 'Togo',
  countryCode: 'TG',
  email: '', // ex. contact@scriptz228.com
  socials: {
    instagram: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    twitch: '',
    facebook: '',
    discord: '',
  },
} as const;

export type SocialKey = keyof typeof site.socials;

export const socialLabels: Record<SocialKey, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  twitch: 'Twitch',
  facebook: 'Facebook',
  discord: 'Discord',
};
