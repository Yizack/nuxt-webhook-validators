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
      twitch: {
        secretKey: 'testTwitchSecretKey',
      },
    },
  },
})
