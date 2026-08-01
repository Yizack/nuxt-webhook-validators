import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = { data: 'testBody' }
const secretKey = nuxtConfig.runtimeConfig?.webhook?.bitbucket?.secretKey

export const simulateBitbucketEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(JSON.stringify(body)))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = `sha256=${computedHash}`

  const headers = {
    'X-Hub-Signature': validSignature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/bitbucket', {
    method: 'POST',
    headers,
    body,
  })
}
