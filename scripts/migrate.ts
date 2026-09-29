// Met la base à jour : tables Better Auth (user, session…) + tables du site (scripts/schema.sql).
//   Local      : npm run db:migrate
//   Production : npm run db:migrate:prod   (utilise .env.prod.bak → Neon)
import { readFile } from 'node:fs/promises';
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
  if (toBeCreated.length || toBeAdded.length) {
    await runMigrations();
    console.log(`✔ ${host} : auth — tables [${toBeCreated.map((t) => t.table).join(', ')}]` +
      ` colonnes ajoutées [${toBeAdded.flatMap((t) => Object.keys(t.fields).map((f) => `${t.table}.${f}`)).join(', ')}]`);
  } else {
    console.log(`✔ ${host} : auth déjà à jour.`);
  }

  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log(`✔ ${host} : tables du site à jour (players, achievements, posts, partners, contact_messages).`);
} finally {
  await pool.end();
}
