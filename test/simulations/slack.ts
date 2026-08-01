import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = { data: 'testBody' }
const secretKey = nuxtConfig.runtimeConfig?.webhook?.slack?.secretKey
const signatureVersion = 'v0'

export const simulateSlackEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signingPayload = `${signatureVersion}:${timestamp}:${JSON.stringify(body)}`
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(signingPayload))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = `${signatureVersion}=${computedHash}`

  const headers = {
    'X-Slack-Signature': validSignature,
    'X-Slack-Request-Timestamp': timestamp.toString(),
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/slack', {
    method: 'POST',
    headers,
    body,
  })
}
