import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'

const GITHUB_SIGNATURE = 'X-Hub-Signature-256'.toLowerCase()

/**
 * Validates GitHub webhooks on the Edge
 * @see {@link https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#javascript-example}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidGitHubWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('github', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const header = headers[GITHUB_SIGNATURE]

  if (!body || !header) return false

  const parts = header.split('=')
  const webhookSignature = parts[1]

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body)
  return computedHash === webhookSignature
}

/**
 * Alias for backwards compatibility
 * @deprecated Use `isValidGitHubWebhook` instead
 */
export const isValidGithubWebhook = isValidGitHubWebhook
