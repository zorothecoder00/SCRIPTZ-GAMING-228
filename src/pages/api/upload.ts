import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from 'astro:env/server';
import { slugify } from '../../lib/admin-resources';

// Les images sont redimensionnées dans le navigateur avant l'envoi : on reste
// largement sous la limite de 4,5 Mo des fonctions Vercel.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/avif'];
const FOLDERS = ['joueurs', 'actualites', 'partenaires', 'divers'];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Accès admin vérifié par le middleware.
export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const file = data.get('file');
  const folder = String(data.get('folder') ?? '');

  if (!(file instanceof File) || file.size === 0) return json({ error: 'Aucun fichier reçu.' }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: 'Format non accepté (JPG, PNG, WebP, GIF, SVG, AVIF).' }, 415);
  if (file.size > MAX_BYTES) return json({ error: 'Image trop lourde (4 Mo max).' }, 413);

  const name = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1].replace('jpeg', 'jpg');

  try {
    const blob = await put(`${FOLDERS.includes(folder) ? folder : 'divers'}/${name}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      // En local : jeton du .env. Sur Vercel : jeton ou OIDC fournis par le store connecté.
      token: BLOB_READ_WRITE_TOKEN,
    });
    return json({ url: blob.url });
  } catch (e) {
    console.error('upload:', e);
    return json({ error: "Échec de l'envoi vers Vercel Blob. Vérifie que le store est connecté au projet." }, 502);
  }
};
