import { subtle } from 'node:crypto'
import { $fetch } from '@nuxt/test-utils'
import { encoder, hmacAlgorithm } from '../../src/runtime/server/lib/helpers'

const body = 'testBody'
const webhookId = 'testPaddleWebhookId'

export const simulatePaddleEvent = async () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await subtle.importKey('raw', encoder.encode(webhookId), hmacAlgorithm, false, ['sign'])
  const hmac = await subtle.sign(hmacAlgorithm.name, signature, encoder.encode(`${timestamp}:${body}`))
  const computedHash = Buffer.from(hmac).toString('hex')

  const validSignature = `h1=${computedHash};ts=${timestamp}`

  const headers = { 'paddle-signature': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/paddle', {
    method: 'POST',
    headers,
    body,
  })
}
