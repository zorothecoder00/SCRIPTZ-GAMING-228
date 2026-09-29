// Crée un compte staff (ou donne le rôle admin à un compte existant).
//   Local      : npm run admin:create -- <email> <pseudo> <mot-de-passe>
//   Production : npm run admin:create:prod -- <email> <pseudo> <mot-de-passe>
import { betterAuth } from 'better-auth';
import pg from 'pg';
import { authOptions } from '../src/lib/auth-options.ts';

const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = process.env;
const [email, name, password] = process.argv.slice(2);

if (!DATABASE_URL || !BETTER_AUTH_SECRET) {
  console.error('DATABASE_URL et BETTER_AUTH_SECRET sont requis.');
  process.exit(1);
}
if (!email || !name || !password) {
  console.error('Usage : npm run admin:create -- <email> <pseudo> <mot-de-passe>');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const host = new URL(DATABASE_URL).host;

try {
  const existing = await pool.query('SELECT id FROM "user" WHERE lower(email) = lower($1)', [email]);
  if (!existing.rowCount) {
    // Seul ce script peut créer des comptes : l'inscription est fermée dans l'app.
    const auth = betterAuth(authOptions(pool, BETTER_AUTH_SECRET, BETTER_AUTH_URL ?? 'http://localhost:4321', { allowSignUp: true }));
    await auth.api.signUpEmail({ body: { email, name, password } });
  }
  await pool.query(`UPDATE "user" SET role = 'admin' WHERE lower(email) = lower($1)`, [email]);
  console.log(`✔ ${host} : ${email} est admin${existing.rowCount ? ' (compte existant, mot de passe inchangé)' : ''}.`);
} finally {
  await pool.end();
}
