import { defineNuxtConfig } from 'nuxt/config'
import myModule from '../../../src/module'
// @ts-expect-error generated on test command
import keys from './test-keys.json'

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
      kick: {
        // Generated on test setup
        publicKey: keys.publicKey,
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
      resend: {
        secretKey: 'test_c3ZpeFNlY3JldEtleQ==',
      },
      shopify: {
        secretKey: 'testShopifySecretKey',
      },
      stripe: {
        secretKey: 'testStripeSecretKey',
      },
      svix: {
        secretKey: 'test_c3ZpeFNlY3JldEtleQ==',
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
