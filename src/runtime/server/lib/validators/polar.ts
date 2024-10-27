import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256 } from '../helpers'
import { useRuntimeConfig } from '#imports'

const POLAR_SIGNATURE_ID = 'webhook-id'
const POLAR_SIGNATURE = 'webhook-signature'
const POLAR_SIGNATURE_TIMESTAMP = 'webhook-timestamp'
const DEFAULT_TOLERANCE = 300 // 5 minutes

/**
 * Validates Polar.sh webhooks on the Edge
 * @see {@link https://docs.polar.sh/api/webhooks#verify-signature}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidPolarWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.polar

  const webhookId = headers[POLAR_SIGNATURE_ID]
  const webhookSignature = headers[POLAR_SIGNATURE]
  const webhookTimestamp = headers[POLAR_SIGNATURE_TIMESTAMP]

  if (!body || !secretKey || !webhookId || !webhookSignature || !webhookTimestamp) return false

  // Validate the timestamp to ensure the request isn't too old
  const now = Math.floor(Date.now() / 1000)
  if (now - Number(webhookTimestamp) > DEFAULT_TOLERANCE) return false

  const payload = `${webhookId}.${webhookTimestamp}.${body}`

  const computedSignature = await computeSignature(secretKey, HMAC_SHA256, payload, { encoding: 'base64' })
  return computedSignature === webhookSignature.split(',')[1]
}
