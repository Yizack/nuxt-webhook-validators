import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretToken = nuxtConfig.runtimeConfig?.webhook?.gitlab?.secretToken

export const simulateGitLabEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretToken), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(body))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = `sha256=${computedHash}`

  const headers = { 'X-Gitlab-Token': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/gitlab', {
    method: 'POST',
    headers,
    body,
  })
}
