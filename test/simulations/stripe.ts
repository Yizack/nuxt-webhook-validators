import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils'
import { encoder, hmacAlgorithm } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.stripe?.secretKey

export const simulateStripeEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), hmacAlgorithm, false, ['sign'])
  const hmac = await subtle.sign(hmacAlgorithm.name, signature, encoder.encode(`${timestamp}.${body}`))
  const computedHash = Buffer.from(hmac).toString('hex')

  const validSignature = `t=${timestamp},v1=${computedHash}`

  const headers = { 'stripe-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body,
  })
}
