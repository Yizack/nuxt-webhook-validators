import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { encoder, ed25519Algorithm } from '../helpers';

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

  const buffer = new Uint8Array(64);
  const match = webhookSignature.match(/.{2}/g) as RegExpMatchArray;
  
  for (let i = 0; i < match.length; i++) {
    buffer[i] = parseInt(match[i], 16);
  }

  const signature = buffer.buffer
  
  const key = await subtle.importKey('raw', Buffer.from(publicKey, 'hex'), ed25519Algorithm, true, ['verify'])
  const isValid = await subtle.verify(ed25519Algorithm.name, key, signature, encoder.encode(webhookTimestamp + body))

  return isValid
}
