import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { ED25519, encoder, stripPemHeaders, sha256 } from '../../src/runtime/server/lib/helpers'
// @ts-expect-error generated on test command
import { ed25519Keys } from '../fixtures/basic/test-keys.json'

const body = [{ test: 'testBody' }]

export const simulateMailChannelsEvent = async () => {
  const privateKeyBuffer = Buffer.from(stripPemHeaders(ed25519Keys.privateKey), 'base64')
  const privateKey = await subtle.importKey('pkcs8', privateKeyBuffer, ED25519, false, ['sign'])

  const timestamp = Math.floor(Date.now() / 1000)
  const bodyHash = await sha256(body, 'base64')
  const contentDigest = `sha-256=:${bodyHash}:`

  const signatureInputValues = `("content-digest");created=${timestamp};alg="ed25519";keyid="mckey"`
  const signatureInput = `sig_123456=${signatureInputValues}`
  const signingString = `"content-digest": ${contentDigest}
"@signature-params": ${signatureInputValues}`

  const signatureBuffer = await subtle.sign(ED25519.name, privateKey, encoder.encode(signingString))
  const signature = `sig_123456=:${Buffer.from(signatureBuffer).toString('base64')}:`

  const headers = {
    'content-digest': contentDigest,
    'signature': signature,
    'signature-input': signatureInput,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/mailchannels', {
    method: 'POST',
    headers,
    body,
  })
}
