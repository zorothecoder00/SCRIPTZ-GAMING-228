import { query } from './db';

export type Player = {
  id: number;
  pseudo: string;
  real_name: string | null;
  game: string;
  role: string | null;
  country: string;
  photo_url: string | null;
  bio: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitch: string | null;
  youtube: string | null;
};

export type Achievement = {
  id: number;
  year: number;
  competition: string;
  result: string;
  game: string | null;
  players: string | null;
  event_date: Date | null;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  published_at: Date;
};

export type Partner = {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
};

export async function getPlayers(limit?: number) {
  const { rows } = await query<Player>(
    `SELECT * FROM players WHERE active ORDER BY sort_order, id ${limit ? 'LIMIT $1' : ''}`,
    limit ? [limit] : [],
  );
  return rows;
}

export async function getAchievements(limit?: number) {
  const { rows } = await query<Achievement>(
    `SELECT * FROM achievements ORDER BY year DESC, event_date DESC NULLS LAST, id DESC ${limit ? 'LIMIT $1' : ''}`,
    limit ? [limit] : [],
  );
  return rows;
}

export async function getPosts(limit?: number) {
  const { rows } = await query<Post>(
    `SELECT * FROM posts WHERE published AND published_at <= now() ORDER BY published_at DESC ${limit ? 'LIMIT $1' : ''}`,
    limit ? [limit] : [],
  );
  return rows;
}

export async function getPost(slug: string) {
  const { rows } = await query<Post>(
    'SELECT * FROM posts WHERE slug = $1 AND published AND published_at <= now()',
    [slug],
  );
  return rows[0] ?? null;
}

export async function getPartners() {
  const { rows } = await query<Partner>('SELECT * FROM partners ORDER BY sort_order, id');
  return rows;
}

export async function saveContactMessage(msg: { name: string; email: string; subject: string | null; message: string }) {
  await query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
    [msg.name, msg.email, msg.subject, msg.message],
  );
}

// --- Helpers d'affichage ---

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Découpe un texte en paragraphes (séparés par une ligne vide). */
export function paragraphs(text: string) {
  return text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
}

/** Titre du type "Champion", "1er", "Vainqueur"… → mis en avant en or. */
export function isWin(result: string) {
  return /champion|vainqueur|1er|1re|winner|or\b|🥇/i.test(result);
}
