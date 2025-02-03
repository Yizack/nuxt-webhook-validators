import { defineNuxtConfig } from 'nuxt/config'
import myModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [myModule],
  runtimeConfig: {
    webhook: {
      discord: {
        publicKey: 'fcf4594ff55a5898a7e7ce541b93dc8ce618c7a4fa96ab7efd1ac2890571345c',
      },
      dropbox: {
        appSecret: 'testDropboxAppSecret',
      },
      github: {
        secretKey: 'testGitHubSecretKey',
      },
      gitlab: {
        secretToken: 'testGitLabSecretToken',
      },
      heroku: {
        secretKey: 'testHerokuSecretKey',
      },
      meta: {
        appSecret: 'testMetaAppSecret',
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
      hygraph: {
        secretKey: 'testHygraphSecretKey',
      },
      polar: {
        secretKey: 'testPolarSecretKey',
      },
    },
  },
  serverDir: '../../../playground/server',
  future: { compatibilityVersion: 4 },
})
