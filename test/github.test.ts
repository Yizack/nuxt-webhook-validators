import { fileURLToPath } from 'node:url'
import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('github', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('valid GitHub webhook', async () => {
    const body = 'testBody'
    const secretKey = 'testGitHubSecretKey'
    const encoder = new TextEncoder()
    const signature = await subtle.importKey('raw', encoder.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const hmac = await subtle.sign('HMAC', signature, encoder.encode(body))
    const computedHash = Buffer.from(hmac).toString('hex')
    const validSignature = `sha256=${computedHash}`

    const headers = { 'X-Hub-Signature-256': validSignature }

    const response = await $fetch<{ isValidWebhook: boolean }>('/api/webhooks/github', {
      method: 'POST',
      headers,
      body,
    })

    expect(response).toStrictEqual({ isValidWebhook: true })
  })
})
