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
      bitbucket: {
        secretKey: '',
      },
      brevo: {
        token: '',
      },
      discord: {
        publicKey: '',
      },
      dropbox: {
        appSecret: '',
      },
      fourthwall: {
        secretKey: '',
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
      hygraph: {
        secretKey: '',
      },
      kick: {
        // (Set in case Kick changes their public key)
        publicKey: '',
      },
      mailchannels: {
        // (Optional unless a specific case)
        publicKey: '',
      },
      meta: {
        appSecret: '',
      },
      paddle: {
        webhookId: '',
      },
      paypal: {
        clientId: '',
        secretKey: '',
        webhookId: '',
      },
      polar: {
        secretKey: '',
      },
      resend: {
        secretKey: '',
      },
      shopify: {
        secretKey: '',
      },
      slack: {
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
      vercel: {
        secretKey: '',
      },
    },
  },
  compatibilityDate: '2025-08-06',
})
