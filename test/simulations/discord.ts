import { subtle } from 'node:crypto'
import { $fetch } from '@nuxt/test-utils'
import { encoder, ed25519Algorithm } from '../../src/runtime/server/lib/helpers'

const body = { type: 0, data: 'testBody' }
const privateKeyJwk: JsonWebKey = { key_ops: ['sign'], ext: true, crv: ed25519Algorithm.name, d: 'YwlnnFf8D1xYAywudxu0velBWEmRSMdo6KJ-5b9sQbU', x: '_PRZT_VaWJin585UG5PcjOYYx6T6lqt-_RrCiQVxNFw', kty: 'OKP' }

export const simulateDiscordEvent = async () => {
  const privateKey = await subtle.importKey('jwk', privateKeyJwk, ed25519Algorithm, true, ['sign'])

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payloadWithTime = timestamp + JSON.stringify(body)
  const signatureBuffer = await subtle.sign(ed25519Algorithm.name, privateKey, encoder.encode(payloadWithTime))
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
