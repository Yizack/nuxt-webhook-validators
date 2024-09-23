import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const appSecret = nuxtConfig.runtimeConfig?.webhook?.dropbox?.appSecret

export const simulateDropboxEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(appSecret), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(body))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = computedHash

  const headers = { 'X-Dropbox-Signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/dropbox', {
    method: 'POST',
    headers,
    body,
  })
}
