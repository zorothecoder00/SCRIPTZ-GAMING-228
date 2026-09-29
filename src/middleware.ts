import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';

// Seules ces pages ont besoin de connaître la session : le reste du site est public
// et évite ainsi une requête à la base par visite.
const isAdminApi = (path: string) => path === '/api/upload';
const needsSession = (path: string) =>
  path === '/admin' || path.startsWith('/admin/') || path === '/connexion' || isAdminApi(path);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  context.locals.user = null;
  context.locals.session = null;

  if (!needsSession(pathname)) return next();

  const result = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = result?.user ?? null;
  context.locals.session = result?.session ?? null;
  const isAdmin = context.locals.user?.role === 'admin';

  if (pathname === '/connexion') {
    return isAdmin ? context.redirect('/admin') : next();
  }

  if (isAdminApi(pathname)) {
    return isAdmin ? next() : Response.json({ error: 'Accès réservé au staff.' }, { status: 401 });
  }

  // /admin/*
  if (!context.locals.user) {
    return context.redirect(`/connexion?redirect=${encodeURIComponent(pathname)}`);
  }
  if (!isAdmin) {
    return new Response('Accès réservé au staff.', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  return next();
});
