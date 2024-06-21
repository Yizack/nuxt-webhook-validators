export default defineNuxtConfig({
  modules: ['../src/module'],
  webhook: {
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
  devtools: { enabled: true },
})
