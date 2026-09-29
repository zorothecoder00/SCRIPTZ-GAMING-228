import { attachDatabasePool } from '@vercel/functions';
import { DATABASE_URL } from 'astro:env/server';
import pg from 'pg';

// Un seul pool partagé : PostgreSQL local en dev, Neon (URL avec pooler) en production.
export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 5_000,
});

// Sur Vercel (Fluid Compute), ferme proprement les connexions inactives avant la suspension.
attachDatabasePool(pool);

export function query<T extends pg.QueryResultRow = any>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
