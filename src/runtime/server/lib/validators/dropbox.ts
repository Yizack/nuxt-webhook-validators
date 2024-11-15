import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'

const DROPBOX_SIGNATURE = 'X-Dropbox-Signature'.toLowerCase()

/**
 * Validates Dropbox webhooks on the Edge
 * @see {@link https://www.dropbox.com/developers/reference/webhooks}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidDropboxWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('dropbox', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const webhookSignature = headers[DROPBOX_SIGNATURE]

  if (!body || !webhookSignature) return false

  const computedHash = await computeSignature(config.appSecret, HMAC_SHA256, body)
  return computedHash === webhookSignature
}
