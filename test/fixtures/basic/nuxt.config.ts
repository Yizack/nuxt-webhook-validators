import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '../../../src/module',
  ],
  serverDir: '../../../playground/server',
  runtimeConfig: {
    webhook: {
      discord: {
        publicKey: 'fcf4594ff55a5898a7e7ce541b93dc8ce618c7a4fa96ab7efd1ac2890571345c',
      },
      github: {
        secretKey: 'testGitHubSecretKey',
      },
      heroku: {
        secretKey: 'testHerokuSecretKey',
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
