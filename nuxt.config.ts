// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/scss/main.scss"],
  runtimeConfig: {
    public: {
      OLLAMA_URL: process.env.OLLAMA_URL,
      PEXELS_API_KEY: process.env.PEXELS_API_KEY,
      UNSTORAGE_PATH: process.env.UNSTORAGE_PATH,
    },
  },
});
