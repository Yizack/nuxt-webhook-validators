import { fileURLToPath } from 'node:url'
import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('paddle', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('valid Paddle webhook', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const body = 'testBody'
    const webhookId = 'testPaddleWebhookId'
    const encoder = new TextEncoder()
    const signature = await subtle.importKey('raw', encoder.encode(webhookId), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const hmac = await subtle.sign('HMAC', signature, encoder.encode(`${timestamp}:${body}`))
    const computedHash = Buffer.from(hmac).toString('hex')

    const validSignature = `h1=${computedHash};ts=${timestamp}`

    const headers = { 'paddle-signature': validSignature }

    const response = await $fetch<{ isValidWebhook: boolean }>('/api/webhooks/paddle', {
      method: 'POST',
      headers,
      body,
    })

    expect(response).toStrictEqual({ isValidWebhook: true })
  })
})
