import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../helpers'

const META_SIGNATURE = 'X-Hub-Signature-256'.toLowerCase()

/**
 * Validates Meta webhooks on the Edge
 * @see {@link https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidMetaWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('meta', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const signatureHeader = headers[META_SIGNATURE]

  if (!signatureHeader) return false
  const [prefix, webhookSignature] = signatureHeader.split('=')

  if (!body || prefix !== 'sha256' || !webhookSignature) return false

  const computedHash = await computeSignature(config.appSecret, HMAC_SHA256, body)
  return computedHash === webhookSignature
}
