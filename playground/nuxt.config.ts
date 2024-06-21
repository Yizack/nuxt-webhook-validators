export default defineNuxtConfig({
  modules: ['../src/module'],
  webhooks: {
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
