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
    }
  }
});
