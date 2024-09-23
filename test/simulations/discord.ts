import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { encoder, ED25519 } from '../../src/runtime/server/lib/helpers'

const body = { type: 0, data: 'testBody' }
const privateKeyJwk: JsonWebKey = { key_ops: ['sign'], ext: true, crv: ED25519.name, d: 'YwlnnFf8D1xYAywudxu0velBWEmRSMdo6KJ-5b9sQbU', x: '_PRZT_VaWJin585UG5PcjOYYx6T6lqt-_RrCiQVxNFw', kty: 'OKP' }

export const simulateDiscordEvent = async () => {
  const privateKey = await subtle.importKey('jwk', privateKeyJwk, ED25519, true, ['sign'])

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payloadWithTime = timestamp + JSON.stringify(body)
  const signatureBuffer = await subtle.sign(ED25519.name, privateKey, encoder.encode(payloadWithTime))
  const signature = Buffer.from(signatureBuffer).toString('hex')

  const headers = {
    'x-signature-ed25519': signature,
    'x-signature-timestamp': timestamp,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/discord', {
    method: 'POST',
    headers,
    body,
  })
}
