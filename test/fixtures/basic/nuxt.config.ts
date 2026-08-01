import { defineNuxtConfig } from 'nuxt/config'
import myModule from '../../../src/module'
// @ts-expect-error generated on test command
import { rsaKeys, ed25519Keys } from './test-keys.json'

export default defineNuxtConfig({
  modules: [myModule],
  runtimeConfig: {
    webhook: {
      bitbucket: {
        secretKey: 'testBitbucketSecretKey',
      },
      brevo: {
        token: 'testToken',
      },
      discord: {
        publicKey: 'fcf4594ff55a5898a7e7ce541b93dc8ce618c7a4fa96ab7efd1ac2890571345c',
      },
      dropbox: {
        appSecret: 'testDropboxAppSecret',
      },
      fourthwall: {
        secretKey: 'testFourthwallSecretKey',
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
      hygraph: {
        secretKey: 'testHygraphSecretKey',
      },
      kick: {
        // Generated on test setup
        publicKey: rsaKeys.publicKey,
      },
      mailchannels: {
        // Generated on test setup
        publicKey: ed25519Keys.publicKey,
      },
      meta: {
        appSecret: 'testMetaAppSecret',
      },
      netlify: {
        secretKey: 'testNetlifySecretKey',
      },
      paddle: {
        webhookId: 'testPaddleWebhookId',
      },
      paypal: {
        clientId: 'testPayPalClientId',
        secretKey: 'testPayPalSecretKey',
        webhookId: 'testPayPalWebhookId',
      },
      polar: {
        secretKey: 'testPolarSecretKey',
      },
      resend: {
        secretKey: 'test_c3ZpeFNlY3JldEtleQ==',
      },
      shopify: {
        secretKey: 'testShopifySecretKey',
      },
      slack: {
        secretKey: 'testSlackSecretKey',
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
      vercel: {
        secretKey: 'testVercelSecretKey',
      },
    },
  },
  serverDir: '../../../playground/server',
  compatibilityDate: '2026-08-02',
})
