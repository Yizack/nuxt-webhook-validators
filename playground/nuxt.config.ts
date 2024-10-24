export default defineNuxtConfig({
  compatibilityDate: '2024-06-17',
  modules: [
    'nuxt-webhook-validators',
  ],
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
      hygraph: {
        secretKey: '',
      },
    },
  },
  devtools: { enabled: true },
  imports: {
    autoImport: true,
  },
})
