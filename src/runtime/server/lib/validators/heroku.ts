import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../helpers'

const HEROKU_HMAC = 'Heroku-Webhook-Hmac-SHA256'.toLowerCase()

/**
 * Validates Heroku webhooks on the Edge
 * @see {@link https://devcenter.heroku.com/articles/app-webhooks#securing-webhook-requests}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidHerokuWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('heroku', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const header = headers[HEROKU_HMAC]

  if (!body || !header) return false

  const webhookSignature = header

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body, { encoding: 'base64' })
  return computedHash === webhookSignature
}
