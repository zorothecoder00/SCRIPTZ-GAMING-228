// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Rendu serveur : nécessaire pour l'authentification et les requêtes à la base.
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret' }),
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Facultatif sur Vercel si le store Blob est connecté en OIDC ; requis en local.
      BLOB_READ_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    }
  }
});
