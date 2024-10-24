import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.hygraph?.secretKey

export const simulateHygraphEvent = async () => {
  const environmentName = 'master'
  const timestamp = Date.now()

  const payload = JSON.stringify({
    Body: JSON.stringify(body),
    EnvironmentName: environmentName,
    TimeStamp: timestamp,
  })

  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(payload))
  const computedHashBase64 = Buffer.from(hmac).toString('base64')
  const validSignature = `sign=${computedHashBase64}, env=${environmentName}, t=${timestamp}`

  const headers = { 'gcms-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/hygraph', {
    method: 'POST',
    headers,
    body,
  })
}
