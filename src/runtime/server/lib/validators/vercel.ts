import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA1, ensureConfiguration, readRawBodyClone } from '../utils'

const VERCEL_SIGNATURE = 'X-Vercel-Signature'.toLowerCase()

/**
 * Validates Vercel webhooks on the Edge
 * @see {@link https://vercel.com/docs/webhooks/webhooks-api#securing-webhooks}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidVercelWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('vercel', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const header = headers[VERCEL_SIGNATURE]

  if (!body || !header) return false

  const bodySignature = await computeSignature(config.secretKey, HMAC_SHA1, body)
  return bodySignature === header
}
