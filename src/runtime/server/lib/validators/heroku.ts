import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, hmacAlgorithm } from '../helpers'
import { useRuntimeConfig } from '#imports'

const HEROKU_HMAC = 'Heroku-Webhook-Hmac-SHA256'.toLowerCase()

/**
 * Validates Heroku webhooks on the Edge
 * @see {@link https://devcenter.heroku.com/articles/app-webhooks#securing-webhook-requests}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidHerokuWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.heroku

  const header = headers[HEROKU_HMAC]

  if (!body || !header) return false

  const webhookSignature = header

  const computedHash = await computeSignature(secretKey, hmacAlgorithm, body, { encoding: 'base64' })
  return computedHash === webhookSignature
}
