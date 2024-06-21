export default defineNuxtConfig({
  compatibilityDate: '2024-06-17',
  modules: [
    'nuxt-webhook-validators',
  ],
  runtimeConfig: {
    webhook: {
      github: {
        secretKey: '',
      },
      paddle: {
        webhookId: '',
      },
      paypal: {
        clientId: '',
        secretKey: '',
        webhookId: '',
      },
      twitch: {
        secretKey: '',
      },
    },
  },
  devtools: { enabled: true },
  imports: {
    autoImport: true,
  },
})
