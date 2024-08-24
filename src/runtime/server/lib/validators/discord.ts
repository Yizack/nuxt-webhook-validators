import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { verifyPublicSignature, ed25519Algorithm } from '../helpers'
import { useRuntimeConfig } from '#imports'

const DISCORD_SIGNATURE = 'x-signature-ed25519'
const DISCORD_SIGNATURE_TIMESTAMP = 'x-signature-timestamp'

/**
 * Validates Discord webhooks on the Edge
 * @see {@link https://discord.com/developers/docs/interactions/overview#setting-up-an-endpoint-validating-security-request-headers}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidDiscordWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { publicKey } = useRuntimeConfig(event).webhook.discord

  const webhookSignature = headers[DISCORD_SIGNATURE]
  const webhookTimestamp = headers[DISCORD_SIGNATURE_TIMESTAMP]

  if (!body || !webhookSignature || !webhookTimestamp) return false

  const payloadWithTime = webhookTimestamp + body

  const isValid = await verifyPublicSignature(publicKey, ed25519Algorithm, payloadWithTime, webhookSignature)
  return isValid
}
