import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.shopify?.secretKey

export const simulateShopifyEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(body))
  const computedHashBase64 = Buffer.from(hmac).toString('base64')
  const validSignature = computedHashBase64

  const headers = {
    'X-Shopify-Hmac-Sha256': validSignature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/shopify', {
    method: 'POST',
    headers,
    body,
  })
}
