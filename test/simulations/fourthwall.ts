import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.fourthwall?.secretKey

export const simulateFourthwallEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(body))
  const computedHash = Buffer.from(hmac).toString('base64')
  const validSignature = computedHash

  const headers = { 'X-Fourthwall-Hmac-SHA256': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/fourthwall', {
    method: 'POST',
    headers,
    body,
  })
}
