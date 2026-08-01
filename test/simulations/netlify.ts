import { $fetch } from '@nuxt/test-utils/e2e'
import { createJwt, sha256 } from '../../src/runtime/server/lib/utils'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = { data: 'testBody' }
const secretKey = nuxtConfig.runtimeConfig?.webhook?.netlify?.secretKey

export const simulateNetlifyEvent = async () => {
  const token = await createJwt(secretKey!, { sha256: await sha256(body) }, { issuer: 'netlify' })

  const headers = {
    'X-Webhook-Signature': token,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/netlify', {
    method: 'POST',
    headers,
    body,
  })
}
