export default defineNuxtConfig({
  modules: [
    '../../../src/module',
  ],
  runtimeConfig: {
    webhook: {
      github: {
        secretKey: 'testGitHubSecretKey',
      },
      paddle: {
        webhookId: 'testPaddleWebhookId',
      },
      paypal: {
        clientId: '',
        secretKey: '',
        webhookId: '',
      },
      stripe: {
        secretKey: 'testStripeSecretKey',
      },
      twitch: {
        secretKey: 'testTwitchSecretKey',
      },
    },
  },
})
