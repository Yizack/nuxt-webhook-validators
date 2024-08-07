import { vi } from 'vitest'

export const simulatePaypalEvent = async () => {
  vi.stubGlobal('$fetch', () => new Promise(resolve => resolve({ isValidWebhook: true })))
  // Stubbing $fetch to return a valid webhook response
  const response = await $fetch('/api/webhooks/paypal', {
    method: 'POST',
  })
  return response
}
