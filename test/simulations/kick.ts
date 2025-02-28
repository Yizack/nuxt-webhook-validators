import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils/e2e'
import { RSASSA_PKCS1_v1_5_SHA256, encoder } from '../../src/runtime/server/lib/helpers'

const body = 'testBody'
const messageId = 'testMessageId'

// Generated key: type: 'pkcs8' | format: 'pem'
const fakePrivateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA7gZlBzqF6bEb3dhHVtO7+ROabJyirCla51ICZMBbxyrKKjp5l7E8Pk8YanZZQQmvkNI8fgsIyMkxwqWgt5koQwIDAQABAkBsQMBF71nkFMaluK2JUbbV6xJ6fyqEvjI3rlakV8/l3jGGL7hP6KItO3TgH4Zy0MUH5EnFBl7W2spjJt2p87rxAiEA/NdaQquie0kSPJPpfxyQ8m5fyZ4bMjuT8Buw2lDU5x0CIQDw/6f4ZfXCZuxYgCjsmwoHj2CEoBGcV8VvkZxR3E1O3wIhAJmz0Ir3C68mnI9221sKYpL9xf0qwB2pWiV8r+YHfWWBAiAt9XNA6aDOa/ZSgk5LoN1ux6buY+A34n0iY7Bd5BdSHQIgTLlJPuQ7e1KTYeJAD5F84uOKMlqMM+bbgFMkzDqqPY4='

export const simulateKickEvent = async () => {
  const privateKeyBuffer = Buffer.from(fakePrivateKey, 'base64')
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
