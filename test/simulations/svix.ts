import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const webhookId = 'testSvixMessageId'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.svix?.secretKey

export const simulateSvixEvent = async (key: string = secretKey!) => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = `${webhookId}.${timestamp}.${body}`
  const secretKeyBase64 = key.split('_')[1]
  const signatureBuffer = Buffer.from(secretKeyBase64, 'base64')
  const signature = await subtle.importKey('raw', signatureBuffer, HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(payload))
  const computedHash = Buffer.from(hmac).toString('base64')
  const validSignature = `v1,${computedHash}`

  const headers = {
    'svix-id': webhookId,
    'svix-signature': validSignature,
    'svix-timestamp': timestamp,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/svix', {
    method: 'POST',
    headers,
    body,
  })
}
