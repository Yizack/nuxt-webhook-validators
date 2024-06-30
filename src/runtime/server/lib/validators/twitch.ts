import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Validates Twitch webhooks on the Edge \
 * Inspired by: https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message
 * @async
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidTwitchWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.twitch

  const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase()
  const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase()
  const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase()
  const HMAC_PREFIX = 'sha256='

  const message_id = headers[TWITCH_MESSAGE_ID]
  const message_timestamp = headers[TWITCH_MESSAGE_TIMESTAMP]
  const message_signature = headers[TWITCH_MESSAGE_SIGNATURE]

  if (!message_id || !message_timestamp || !message_signature) return false

  const message = message_id + message_timestamp + body

  const encoder = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }

  const key = await subtle.importKey('raw', encoder.encode(secretKey), algorithm, false, ['sign'])
  const hmac = await subtle.sign(algorithm.name, key, encoder.encode(message))

  const computedHash = HMAC_PREFIX + Buffer.from(hmac).toString('hex')

  return computedHash === message_signature
}
