import { query } from './db';

// Description des contenus gérés dans /admin. Les noms de tables/colonnes viennent
// uniquement d'ici (jamais de la requête) ; les valeurs passent toujours en paramètres SQL.

type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'date' | 'checkbox' | 'country';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  default?: string | number | boolean;
};

export type Resource = {
  table: string;
  label: string;
  singular: string;
  icon: string;
  fields: Field[];
  columns: string[]; // colonnes affichées dans la liste
  orderBy: string;
  readOnly?: boolean; // pas de création/édition (ex. messages reçus)
  beforeSave?: (values: Record<string, unknown>) => void;
};

const socialField = (name: string, label: string): Field => ({ name, label, type: 'url', placeholder: 'https://…' });

export const resources: Record<string, Resource> = {
  joueurs: {
    table: 'players',
    label: 'Joueurs',
    singular: 'joueur',
    icon: '🕹️',
    orderBy: 'sort_order, id',
    columns: ['pseudo', 'game', 'role', 'active'],
    fields: [
      { name: 'pseudo', label: 'Pseudo', type: 'text', required: true },
      { name: 'real_name', label: 'Nom réel', type: 'text' },
      { name: 'game', label: 'Jeu', type: 'text', required: true, placeholder: 'EA FC 26, eFootball, CODM…', help: 'Les joueurs sont regroupés par jeu sur la page Équipe.' },
      { name: 'role', label: 'Rôle', type: 'text', placeholder: 'Capitaine, Coach, Joueur…' },
      { name: 'country', label: 'Pays (code 2 lettres)', type: 'country', required: true, default: 'TG', help: 'TG = Togo, BJ = Bénin, CI = Côte d’Ivoire…' },
      { name: 'photo_url', label: 'Photo (URL)', type: 'url', placeholder: 'https://…', help: 'Format portrait conseillé (4:5).' },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      socialField('instagram', 'Instagram'),
      socialField('tiktok', 'TikTok'),
      socialField('twitter', 'X / Twitter'),
      socialField('twitch', 'Twitch'),
      socialField('youtube', 'YouTube'),
      { name: 'sort_order', label: 'Ordre d’affichage', type: 'number', default: 0, help: 'Plus petit = affiché en premier.' },
      { name: 'active', label: 'Visible sur le site', type: 'checkbox', default: true },
    ],
  },
  palmares: {
    table: 'achievements',
    label: 'Palmarès',
    singular: 'résultat',
    icon: '🏆',
    orderBy: 'year DESC, event_date DESC NULLS LAST, id DESC',
    columns: ['year', 'competition', 'result', 'game'],
    fields: [
      { name: 'year', label: 'Année', type: 'number', required: true, default: new Date().getFullYear() },
      { name: 'competition', label: 'Compétition', type: 'text', required: true },
      { name: 'result', label: 'Résultat', type: 'text', required: true, placeholder: 'Champion, 2e, Top 8…', help: '« Champion », « Vainqueur » ou « 1er » affichent un trophée 🏆.' },
      { name: 'game', label: 'Jeu', type: 'text' },
      { name: 'players', label: 'Joueur(s)', type: 'text', placeholder: 'Pseudo(s)' },
      { name: 'event_date', label: 'Date', type: 'date' },
    ],
  },
  actualites: {
    table: 'posts',
    label: 'Actualités',
    singular: 'article',
    icon: '📰',
    orderBy: 'published_at DESC, id DESC',
    columns: ['title', 'published_at', 'published'],
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'slug', label: 'Adresse (slug)', type: 'text', help: 'Laisse vide pour la générer depuis le titre.' },
      { name: 'excerpt', label: 'Résumé', type: 'textarea', help: 'Affiché sur les cartes et pour le partage.' },
      { name: 'content', label: 'Contenu', type: 'textarea', required: true, help: 'Sépare les paragraphes par une ligne vide.' },
      { name: 'cover_url', label: 'Image de couverture (URL)', type: 'url', placeholder: 'https://…' },
      { name: 'published_at', label: 'Date de publication', type: 'date' },
      { name: 'published', label: 'Publié', type: 'checkbox', default: false },
    ],
    beforeSave(values) {
      if (!values.slug) values.slug = slugify(String(values.title));
      else values.slug = slugify(String(values.slug));
      if (!values.published_at) values.published_at = new Date();
    },
  },
  partenaires: {
    table: 'partners',
    label: 'Partenaires',
    singular: 'partenaire',
    icon: '🤝',
    orderBy: 'sort_order, id',
    columns: ['name', 'website'],
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'logo_url', label: 'Logo (URL)', type: 'url', placeholder: 'https://…', help: 'PNG/SVG sur fond transparent de préférence.' },
      { name: 'website', label: 'Site web', type: 'url', placeholder: 'https://…' },
      { name: 'sort_order', label: 'Ordre d’affichage', type: 'number', default: 0 },
    ],
  },
  messages: {
    table: 'contact_messages',
    label: 'Messages',
    singular: 'message',
    icon: '✉️',
    orderBy: 'created_at DESC',
    columns: ['created_at', 'name', 'email', 'subject'],
    readOnly: true,
    fields: [
      { name: 'name', label: 'Nom', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'text' },
      { name: 'subject', label: 'Sujet', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'created_at', label: 'Reçu le', type: 'date' },
    ],
  },
};

export function getResource(key: string | undefined) {
  return key && Object.hasOwn(resources, key) ? resources[key] : null;
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `article-${Date.now()}`;
}

/** Convertit le formulaire en valeurs SQL et renvoie les erreurs de saisie. */
export function parseForm(resource: Resource, data: FormData) {
  const values: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const f of resource.fields) {
    const raw = String(data.get(f.name) ?? '').trim();
    let value: unknown = raw || null;

    switch (f.type) {
      case 'checkbox':
        value = data.get(f.name) === 'on';
        break;
      case 'number':
        value = raw === '' ? (f.default ?? null) : Number.parseInt(raw, 10);
        if (Number.isNaN(value)) errors.push(`${f.label} : nombre invalide.`);
        break;
      case 'country':
        value = raw.toUpperCase();
        if (!/^[A-Z]{2}$/.test(raw.toUpperCase())) errors.push(`${f.label} : 2 lettres attendues (ex. TG).`);
        break;
      case 'url':
        if (raw && !/^https?:\/\/\S+$/i.test(raw)) errors.push(`${f.label} : l'adresse doit commencer par https://`);
        break;
    }

    if (f.required && (value === null || value === '')) errors.push(`${f.label} est obligatoire.`);
    values[f.name] = value;
  }

  if (!errors.length) resource.beforeSave?.(values);
  return { values, errors };
}

export async function listRows(resource: Resource) {
  const { rows } = await query(`SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy}`);
  return rows;
}

export async function getRow(resource: Resource, id: number) {
  const { rows } = await query(`SELECT * FROM ${resource.table} WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function insertRow(resource: Resource, values: Record<string, unknown>) {
  const cols = Object.keys(values);
  const { rows } = await query(
    `INSERT INTO ${resource.table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    Object.values(values),
  );
  return rows[0].id as number;
}

export async function updateRow(resource: Resource, id: number, values: Record<string, unknown>) {
  const cols = Object.keys(values);
  await query(
    `UPDATE ${resource.table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${cols.length + 1}`,
    [...Object.values(values), id],
  );
}

export async function deleteRow(resource: Resource, id: number) {
  await query(`DELETE FROM ${resource.table} WHERE id = $1`, [id]);
}

/** Valeur d'un champ pour l'afficher dans un <input>. */
export function inputValue(field: Field, row: Record<string, unknown> | null) {
  const v = row ? row[field.name] : field.default;
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** Valeur d'une cellule dans la liste. */
export function cellValue(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? '✔' : '✗';
  if (v instanceof Date) return v.toLocaleDateString('fr-FR');
  const s = String(v);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}
