import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const webhookId = 'test-id'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.polar?.secretKey

export const simulatePolarEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = `${webhookId}.${timestamp}.${body}`
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(payload))
  const computedHashBase64 = Buffer.from(hmac).toString('base64')
  const validSignature = `v1,${computedHashBase64}`

  const headers = {
    'webhook-id': webhookId,
    'webhook-timestamp': timestamp,
    'webhook-signature': validSignature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/polar', {
    method: 'POST',
    headers,
    body,
  })
}
