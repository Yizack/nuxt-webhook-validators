import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { encoder, hmacAlgorithm } from '../helpers'
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

  const key = await subtle.importKey('raw', encoder.encode(secretKey), hmacAlgorithm, false, ['sign'])
  const hmac = await subtle.sign(hmacAlgorithm.name, key, encoder.encode(body))

  const computedBase64 = Buffer.from(hmac).toString('base64')

  return computedBase64 === webhookSignature
}
