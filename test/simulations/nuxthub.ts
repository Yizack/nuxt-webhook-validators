import { sha256 } from 'ohash'
import { $fetch } from '@nuxt/test-utils'

const body = 'testBody'
const secretKey = 'testNuxtHubSecretKey'

export const simulateNuxthubEvent = async () => {
  const validSignature = sha256(body + secretKey)

  const headers = { 'x-nuxthub-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/nuxthub', {
    method: 'POST',
    headers,
    body,
  })
}
