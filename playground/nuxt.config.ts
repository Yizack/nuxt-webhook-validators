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
      nuxthub: {
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
      stripe: {
        secretKey: '',
      },
      twitch: {
        secretKey: '',
      },
      discord: {
        publicKey: '',
      },
    },
  },
  devtools: { enabled: true },
  imports: {
    autoImport: true,
  },
})
