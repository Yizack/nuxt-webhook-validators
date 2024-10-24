export default defineNuxtConfig({
  modules: [
    'nuxt-webhook-validators',
  ],
  imports: {
    autoImport: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    webhook: {
      discord: {
        publicKey: '',
      },
      github: {
        secretKey: '',
      },
      heroku: {
        secretKey: '',
      },
      meta: {
        appSecret: '',
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
    },
  },
  compatibilityDate: '2024-06-17',
})
