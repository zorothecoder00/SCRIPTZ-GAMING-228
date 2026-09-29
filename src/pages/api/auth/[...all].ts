import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';

// Toutes les routes Better Auth : /api/auth/sign-up/email, /api/auth/sign-in/email, /api/auth/sign-out…
export const ALL: APIRoute = ({ request }) => auth.handler(request);
