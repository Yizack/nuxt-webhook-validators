import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../utils'

const SHOPIFY_SIGNATURE = 'X-Shopify-Hmac-Sha256'.toLowerCase()

/**
 * Validates Shopify webhooks on the Edge
 * @see {@link https://shopify.dev/docs/apps/build/webhooks}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidShopifyWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('shopify', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const webhookSignature = headers[SHOPIFY_SIGNATURE]

  if (!body || !webhookSignature) return false

  const computedBase64 = await computeSignature(config.secretKey, HMAC_SHA256, body, { encoding: 'base64' })
  return computedBase64 === webhookSignature
}
