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
      gitlab: {
        secretToken: '',
      },
      heroku: {
        secretKey: '',
      },
      kick: {
        // (Set in case Kick changes their public key)
        publicKey: '',
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
      polar: {
        secretKey: '',
      },
    },
  },
  compatibilityDate: '2024-06-17',
})
