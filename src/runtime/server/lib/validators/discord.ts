import { sha256 } from 'ohash'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { nodeEd25519Algorithm } from '../helpers';

const DISCORD_SIGNATURE = 'x-signature-ed25519';
const DISCORD_SIGNATURE_TIMESTAMP = 'x-signature-timestamp';

/**
 * Validates Discord webhooks on the Edge \
 * Info: 
 * @async
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

  const key = await crypto.subtle.importKey('raw', Buffer.from(publicKey, 'hex'), nodeEd25519Algorithm, true, ['verify'])
  const isValid = await crypto.subtle.verify(nodeEd25519Algorithm, key, Buffer.from(webhookSignature, 'hex'), Buffer.from(webhookTimestamp + body))

  return isValid
}
