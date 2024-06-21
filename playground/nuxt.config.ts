export default defineNuxtConfig({
  modules: ['../src/module'],
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
})
