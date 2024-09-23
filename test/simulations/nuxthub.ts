import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.nuxthub?.secretKey

export const simulateNuxthubEvent = async () => {
  const payload = body + secretKey
  const signatureBuffer = await subtle.digest(HMAC_SHA256.hash, encoder.encode(payload))
  const validSignature = Buffer.from(signatureBuffer).toString('hex')

  const headers = { 'x-nuxthub-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/nuxthub', {
    method: 'POST',
    headers,
    body,
  })
}
