import { fileURLToPath } from 'node:url'
import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('twitch', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('valid Twitch webhook', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const body = 'testBody'
    const messageId = 'testMessageId'
    const secretKey = 'testTwitchSecretKey'
    const message = messageId + timestamp + body
    const encoder = new TextEncoder()
    const signature = await subtle.importKey('raw', encoder.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const hmac = await subtle.sign('HMAC', signature, encoder.encode(message))
    const computedHash = Buffer.from(hmac).toString('hex')
    const validSignature = `sha256=${computedHash}`

    const headers = {
      'Twitch-Eventsub-Message-Id': messageId,
      'Twitch-Eventsub-Message-Timestamp': timestamp.toString(),
      'Twitch-Eventsub-Message-Signature': validSignature,
    }

    const response = await $fetch<{ isValidWebhook: boolean }>('/api/webhooks/twitch', {
      method: 'POST',
      headers,
      body,
    })

    expect(response).toStrictEqual({ isValidWebhook: true })
  })
})
