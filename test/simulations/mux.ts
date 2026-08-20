import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const webhookId = nuxtConfig.runtimeConfig?.webhook?.mux?.secretKey

export const simulateMuxEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await subtle.importKey('raw', encoder.encode(webhookId), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(`${timestamp}:${body}`))
  const computedHash = Buffer.from(hmac).toString('hex')

  const validSignature = `v1=${computedHash};t=${timestamp}`

  const headers = { 'mux-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/mux', {
    method: 'POST',
    headers,
    body,
  })
}
