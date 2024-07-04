export default defineNuxtConfig({
  modules: [
    '../../../src/module',
  ],
  serverDir: '../../../playground/server',
  runtimeConfig: {
    webhook: {
      github: {
        secretKey: 'testGitHubSecretKey',
      },
      nuxthub: {
        secretKey: 'testNuxtHubSecretKey',
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
