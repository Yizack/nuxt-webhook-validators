import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'

const FOURTHWALL_SIGNATURE = 'X-Fourthwall-Hmac-SHA256'.toLowerCase()

/**
 * Validates Fourthwall webhooks on the Edge
 * @see {@link https://docs.fourthwall.com/webhooks/signature-verification/}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidFourthwallWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('fourthwall', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const webhookSignature = headers[FOURTHWALL_SIGNATURE]

  if (!body || !webhookSignature) return false

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body, { encoding: 'base64' })
  return computedHash === webhookSignature
}
