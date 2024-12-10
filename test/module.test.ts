import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import type { RuntimeConfig } from '@nuxt/schema'
import { ensureConfiguration } from '../src/runtime/server/lib/helpers'
import nuxtConfig from './fixtures/basic/nuxt.config'
import * as events from './events'

const validWebhook = { isValidWebhook: true }

await setup({ rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)) })
vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn(() => nuxtConfig.runtimeConfig),
}))

describe('ssr', () => {
  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>Nuxt Webhook Validators</div>')
  })
})

describe('ensureConfiguration method', () => {
  it('returns the configuration object', () => {
    if (!nuxtConfig.runtimeConfig?.webhook) return
    for (const [key, config] of Object.entries(nuxtConfig.runtimeConfig.webhook)) {
      const provider = key as keyof RuntimeConfig['webhook']
      if (provider === 'paypal') {
        expect(() => ensureConfiguration(provider)).toThrowError()
        continue
      }
      const resultConfig = ensureConfiguration(provider)
      expect(resultConfig).toStrictEqual(config)
    }
  })
})

describe('webhooks', () => {
  it('valid Discord webhook', async () => {
    const response = await events.simulateDiscordEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Dropbox webhook', async () => {
    const response = await events.simulateDropboxEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid GitHub webhook', async () => {
    const response = await events.simulateGitHubEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Heroku webhook', async () => {
    const response = await events.simulateHerokuEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Meta webhook', async () => {
    const response = await events.simulateMetaEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid NuxtHub webhook', async () => {
    const response = await events.simulateNuxthubEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Paddle webhook', async () => {
    const response = await events.simulatePaddleEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Paypal webhook', async () => {
    const response = await events.simulatePaypalEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Stripe webhook', async () => {
    const response = await events.simulateStripeEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Twitch webhook', async () => {
    const response = await events.simulateTwitchEvent()
    expect(response).toStrictEqual(validWebhook)
  })
  it('valid Hygraph webhook', async () => {
    const response = await events.simulateHygraphEvent()
    expect(response).toStrictEqual(validWebhook)
  })
  it('valid Polar webhook', async () => {
    const response = await events.simulatePolarEvent()
    expect(response).toStrictEqual(validWebhook)
  })
})
