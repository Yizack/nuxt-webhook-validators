export default defineNuxtConfig({
  modules: [
    '../src/module',
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
      resend: {
        secretKey: '',
      },
      shopify: {
        secretKey: '',
      },
      stripe: {
        secretKey: '',
      },
      svix: {
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
