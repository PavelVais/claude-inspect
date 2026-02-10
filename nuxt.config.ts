import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['floating-vue/nuxt'],

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss() as any],
  },

  runtimeConfig: {
    projectPath: process.env.PROJECT_PATH || '/project',
  },

  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: ['node'],
        },
      },
    },
  },
})
