export default defineNuxtConfig({
  modules: ['../src/module'],
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
  devtools: { enabled: true },
})
