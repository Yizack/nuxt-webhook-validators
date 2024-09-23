import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const messageId = 'testMessageId'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.twitch?.secretKey

export const simulateTwitchEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const message = messageId + timestamp + body
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(message))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = `sha256=${computedHash}`

  const headers = {
    'Twitch-Eventsub-Message-Id': messageId,
    'Twitch-Eventsub-Message-Timestamp': timestamp.toString(),
    'Twitch-Eventsub-Message-Signature': validSignature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/twitch', {
    method: 'POST',
    headers,
    body,
  })
}
