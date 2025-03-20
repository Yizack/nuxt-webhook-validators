import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { RSASSA_PKCS1_v1_5_SHA256, encoder, stripPemHeaders } from '../../src/runtime/server/lib/helpers'
// @ts-expect-error generated on test command
import keys from '../fixtures/basic/test-keys.json'

const body = 'testBody'
const messageId = 'testMessageId'

export const simulateKickEvent = async () => {
  const privateKeyBuffer = Buffer.from(stripPemHeaders(keys.privateKey), 'base64')
  const privateKey = await subtle.importKey('pkcs8', privateKeyBuffer, RSASSA_PKCS1_v1_5_SHA256, false, ['sign'])

  const timestamp = Math.floor(Date.now() / 1000)
  const payload = `${messageId}.${timestamp}.${body}`

  const signatureBuffer = await subtle.sign(RSASSA_PKCS1_v1_5_SHA256.name, privateKey, encoder.encode(payload))
  const signature = Buffer.from(signatureBuffer).toString('base64')

  const headers = {
    'Kick-Event-Message-Id': messageId,
    'Kick-Event-Message-Timestamp': timestamp.toString(),
    'Kick-Event-Signature': signature,
  }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/kick', {
    method: 'POST',
    headers,
    body,
  })
}
