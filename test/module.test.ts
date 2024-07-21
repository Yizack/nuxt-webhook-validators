import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import * as events from './events'

const validWebhook = { isValidWebhook: true }

await setup({ rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)) })

describe('ssr', () => {
  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>Nuxt Webhook Validators</div>')
  })
})

describe('webhooks', () => {
  it('valid Discord webhook', async () => {
    const response = await events.simulateDiscordEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid GitHub webhook', async () => {
    const response = await events.simulateGithubEvent()
    expect(response).toStrictEqual(validWebhook)
  })

  it('valid Heroku webhook', async () => {
    const response = await events.simulateHerokuEvent()
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
})
