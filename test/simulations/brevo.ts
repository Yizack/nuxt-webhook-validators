import { $fetch } from '@nuxt/test-utils/e2e'

const body = { test: 'testData' }

export const simulateBrevoEvent = async () => {
  const headers = {
    'authorization': 'Bearer testToken',
    'x-forwarded-for': '1.179.112.0',
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/brevo', {
    method: 'POST',
    headers,
    body,
  })
}
