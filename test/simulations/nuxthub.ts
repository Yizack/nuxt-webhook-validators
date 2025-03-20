import { $fetch } from '@nuxt/test-utils/e2e'
import { sha256 } from '../../src/runtime/server/lib/helpers'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = { message: 'NuxtHub Sample Webhook, this is a test message from NuxtHub Admin' }
const secretKey = nuxtConfig.runtimeConfig?.webhook?.nuxthub?.secretKey

export const simulateNuxthubEvent = async () => {
  const payload = JSON.stringify(body) + secretKey
  const validSignature = await sha256(payload)

  const headers = { 'x-nuxthub-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/nuxthub', {
    method: 'POST',
    headers,
    body,
  })
}
