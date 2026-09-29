import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';

// Pages réservées aux membres connectés.
const PROTECTED = ['/compte'];
// Pages inutiles quand on est déjà connecté.
const GUEST_ONLY = ['/connexion', '/inscription'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Les routes d'API auth gèrent elles-mêmes la session.
  if (pathname.startsWith('/api/auth')) return next();

  const result = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = result?.user ?? null;
  context.locals.session = result?.session ?? null;

  if (!context.locals.user && PROTECTED.some((p) => pathname.startsWith(p))) {
    return context.redirect(`/connexion?redirect=${encodeURIComponent(pathname)}`);
  }
  if (context.locals.user && GUEST_ONLY.includes(pathname)) {
    return context.redirect('/compte');
  }

  return next();
});
