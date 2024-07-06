import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { encoder, hmacAlgorithm } from '../helpers'
import { useRuntimeConfig } from '#imports'

const GITHUB_SIGNATURE = 'X-Hub-Signature-256'.toLowerCase()

/**
 * Validates GitHub webhooks on the Edge
 * @see {@link https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#javascript-example}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidGithubWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.github

  const header = headers[GITHUB_SIGNATURE]

  if (!body || !header) return false

  const parts = header.split('=')
  const webhookSignature = parts[1]

  const extractable = false
  const key = await subtle.importKey('raw', encoder.encode(secretKey), hmacAlgorithm, extractable, ['sign'])
  const hmac = await subtle.sign(hmacAlgorithm.name, key, encoder.encode(body))

  const computedHash = Buffer.from(hmac).toString('hex')

  return computedHash === webhookSignature
}
