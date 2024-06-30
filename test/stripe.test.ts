import { fileURLToPath } from 'node:url'
import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('stripe', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('valid Stripe webhook', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const body = 'testBody'
    const secretKey = 'testStripeSecretKey'
    const encoder = new TextEncoder()
    const signature = await subtle.importKey('raw', encoder.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const hmac = await subtle.sign('HMAC', signature, encoder.encode(`${timestamp}.${body}`))
    const computedHash = Buffer.from(hmac).toString('hex')

    const validSignature = `t=${timestamp},v1=${computedHash}`

    const headers = { 'stripe-signature': validSignature }

    const response = await $fetch<{ isValidWebhook: boolean }>('/api/webhooks/stripe', {
      method: 'POST',
      headers,
      body,
    })

    expect(response).toStrictEqual({ isValidWebhook: true })
  })
})
