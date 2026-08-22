import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, HMAC_SHA256 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretKey = nuxtConfig.runtimeConfig?.webhook?.docusign?.secretKey
const username = nuxtConfig.runtimeConfig?.webhook?.docusign?.username
const password = nuxtConfig.runtimeConfig?.webhook?.docusign?.password

export const simulateDocusignEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), HMAC_SHA256, false, ['sign'])
  const hmac = await subtle.sign(HMAC_SHA256.name, signature, encoder.encode(body))
  const computedHash = Buffer.from(hmac).toString('base64')
  const validSignature = computedHash
  const isBasicAuth = username && password
  const validAuthorization = isBasicAuth ? Buffer.from(`${username}:${password}`).toString('base64') : undefined

  const headers = {
    'X-Docusign-Signature-1': 'InvalidSignature',
    'X-Docusign-Signature-2': validSignature,
    'X-Docusign-Signature-3': 'AnotherInvalidSignature',
    ...(isBasicAuth ? { Authorization: `Basic ${validAuthorization}` } : {}),
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/docusign', {
    method: 'POST',
    headers,
    body,
  })
}
