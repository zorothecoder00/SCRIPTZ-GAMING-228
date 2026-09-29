import { createAuthClient } from 'better-auth/client';

// Client navigateur : appelle /api/auth/* sur le même domaine.
export const authClient = createAuthClient();
