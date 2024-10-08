import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.stripe?.secretKey

export const simulateStripeEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(`${timestamp}.${body}`))
  const computedHash = Buffer.from(hmac).toString('hex')

  const validSignature = `t=${timestamp},v1=${computedHash}`

  const headers = { 'stripe-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body,
  })
}
