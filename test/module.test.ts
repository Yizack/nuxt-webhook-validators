import { fileURLToPath } from 'node:url'
import { rm } from 'node:fs/promises'
import { describe, it, expect, vi, afterAll } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import type { RuntimeConfig } from '@nuxt/schema'
import { ensureConfiguration } from '../src/runtime/server/lib/helpers'
import { generateTestingKeys } from './genKeys'

const validWebhook = { isValidWebhook: true }

// Generate test keys
await generateTestingKeys()
const nuxtConfig = (await import('./fixtures/basic/nuxt.config')).default

// Nuxt setup
await setup({ rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)) })

// Start tests
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

describe('webhooks', async () => {
  vi.mock('#imports', () => ({
    useRuntimeConfig: vi.fn(() => nuxtConfig.runtimeConfig),
  }))

  afterAll(() => {
    rm(fileURLToPath(new URL('./fixtures/basic/test-keys.json', import.meta.url)))
  })

  // Iterate over the `events` object dynamically
  const events = await import('./events')
  for (const [methodName, simulation] of Object.entries(events)) {
    const [, webhookName] = methodName.match(/^simulate(.*)Event$/) || []
    if (!webhookName) continue
    it(`valid ${webhookName} webhook`, async () => {
      const response = await simulation()
      expect(response).toStrictEqual(validWebhook)
    })
  }
})
