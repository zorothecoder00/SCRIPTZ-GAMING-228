import type { BetterAuthOptions } from 'better-auth';
import type { Pool } from 'pg';

// Options partagées entre l'app (src/lib/auth.ts) et les scripts (scripts/*.ts).
// Ce fichier ne doit pas importer de modules `astro:*` pour rester utilisable hors d'Astro.
export function authOptions(pool: Pool, secret: string, siteURL?: string, { allowSignUp = false } = {}) {
  return {
    appName: 'Scriptz Gaming 228',
    database: pool,
    secret,
    // L'URL est déduite de la requête, limitée à ces hôtes : dev local (tout port),
    // déploiements Vercel (prod + previews) et domaine perso via BETTER_AUTH_URL.
    baseURL: {
      allowedHosts: ['localhost:*', '*.vercel.app', ...(siteURL ? [new URL(siteURL).host] : [])],
      fallback: siteURL,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Pas d'inscription publique : les comptes staff sont créés avec `npm run admin:create`.
      disableSignUp: !allowSignUp,
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'member', input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 jours
      updateAge: 60 * 60 * 24, // rafraîchie une fois par jour
    },
  } satisfies BetterAuthOptions;
}
