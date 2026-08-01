import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA1 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = { data: 'testBody' }
const secretKey = nuxtConfig.runtimeConfig?.webhook?.vercel?.secretKey

export const simulateVercelEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA1, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA1.name, signature, encoder.encode(JSON.stringify(body)))
  const validSignature = Buffer.from(hmac).toString('hex')

  const headers = {
    'X-Vercel-Signature': validSignature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/vercel', {
    method: 'POST',
    headers,
    body,
  })
}
