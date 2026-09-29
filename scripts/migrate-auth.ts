// Crée / met à jour les tables Better Auth (user, session, account, verification).
//   Local      : npm run db:migrate
//   Production : npm run db:migrate:prod   (utilise .env.prod.bak → Neon)
import { getMigrations } from 'better-auth/db/migration';
import pg from 'pg';
import { authOptions } from '../src/lib/auth-options.ts';

const { DATABASE_URL, BETTER_AUTH_SECRET } = process.env;
if (!DATABASE_URL || !BETTER_AUTH_SECRET) {
  console.error('DATABASE_URL et BETTER_AUTH_SECRET sont requis.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const host = new URL(DATABASE_URL).host;

try {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authOptions(pool, BETTER_AUTH_SECRET));
  if (!toBeCreated.length && !toBeAdded.length) {
    console.log(`✔ ${host} : schéma d'authentification déjà à jour.`);
  } else {
    await runMigrations();
    console.log(`✔ ${host} : tables créées [${toBeCreated.map((t) => t.table).join(', ')}]` +
      (toBeAdded.length ? `, colonnes ajoutées dans [${toBeAdded.map((t) => t.table).join(', ')}]` : ''));
  }
} finally {
  await pool.end();
}
