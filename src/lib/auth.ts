import { betterAuth } from 'better-auth';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from 'astro:env/server';
import { authOptions } from './auth-options';
import { pool } from './db';

export const auth = betterAuth(authOptions(pool, BETTER_AUTH_SECRET, BETTER_AUTH_URL));

export type Session = typeof auth.$Infer.Session;
