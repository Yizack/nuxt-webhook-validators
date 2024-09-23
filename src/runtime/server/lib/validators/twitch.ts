import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256 } from '../helpers'
import { useRuntimeConfig } from '#imports'

const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase()
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase()
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase()
const HMAC_PREFIX = 'sha256='

/**
 * Validates Twitch webhooks on the Edge
 * @see {@link https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidTwitchWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.twitch

  const message_id = headers[TWITCH_MESSAGE_ID]
  const message_timestamp = headers[TWITCH_MESSAGE_TIMESTAMP]
  const message_signature = headers[TWITCH_MESSAGE_SIGNATURE]

  if (!message_id || !message_timestamp || !message_signature) return false

  const message = message_id + message_timestamp + body

  const computedHash = await computeSignature(secretKey, HMAC_SHA256, message)
  return HMAC_PREFIX + computedHash === message_signature
}
