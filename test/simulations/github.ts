import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { $fetch } from '@nuxt/test-utils'
import { encoder, hmacAlgorithm } from '../../src/runtime/server/lib/helpers'

const body = 'testBody'
const secretKey = 'testGitHubSecretKey'

export const simulateGithubEvent = async () => {
  const signature = await subtle.importKey('raw', encoder.encode(secretKey), hmacAlgorithm, false, ['sign'])
  const hmac = await subtle.sign(hmacAlgorithm.name, signature, encoder.encode(body))
  const computedHash = Buffer.from(hmac).toString('hex')
  const validSignature = `sha256=${computedHash}`

  const headers = { 'X-Hub-Signature-256': validSignature }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/github', {
    method: 'POST',
    headers,
    body,
  })
}
