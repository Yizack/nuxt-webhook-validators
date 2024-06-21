import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'

export const isValidGithubWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.github

  const GITHUB_SIGNATURE = 'X-Hub-Signature-256'.toLowerCase()
  const header = headers[GITHUB_SIGNATURE]

  if (!body || !header) return false

  const parts = header.split('=')
  const webhookSignature = parts[1]

  const encoder = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }

  const extractable = false
  const key = await subtle.importKey('raw', encoder.encode(secretKey), algorithm, extractable, ['sign'])
  const hmac = await subtle.sign(algorithm.name, key, encoder.encode(body))

  const computedHash = Buffer.from(hmac).toString('hex')

  return computedHash === webhookSignature
}
