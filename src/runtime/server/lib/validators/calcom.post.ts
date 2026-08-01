import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../utils'

const CALCOM_SIGNATURE = 'X-Cal-Signature-256'.toLowerCase()

/**
 * Validates Cal.com webhooks on the Edge
 * @see {@link https://cal.com/docs/developing/guides/automation/webhooks#verifying-the-authenticity-of-the-received-payload}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidCalcomWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('calcom', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)
  const signature = headers[CALCOM_SIGNATURE]

  if (!signature || !body) return false

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body)
  return signature === computedHash
}
