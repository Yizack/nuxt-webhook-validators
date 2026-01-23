import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../helpers'

const SLACK_SIGNATURE = 'X-Slack-Signature'.toLowerCase()
const SLACK_TIMESTAMP = 'X-Slack-Request-Timestamp'.toLowerCase()
const DEFAULT_TOLERANCE = 300 // 5 minutes

/**
 * Validates Slack webhooks on the Edge
 * @see {@link https://docs.slack.dev/authentication/verifying-requests-from-slack/}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidSlackWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('slack', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const fullSignature = headers[SLACK_SIGNATURE]
  const timestamp = headers[SLACK_TIMESTAMP]

  if (!body || !fullSignature || !timestamp) return false

  // Validate the timestamp to avoid replay attacks
  const now = Math.floor(Date.now() / 1000)
  if (now - Number.parseInt(timestamp) > DEFAULT_TOLERANCE) return false

  const [signatureVersion, webhookSignature] = fullSignature.split('=')
  const payload = `${signatureVersion}:${timestamp}:${body}`

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, payload)
  return computedHash === webhookSignature
}
