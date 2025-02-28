import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { encoder, HMAC_SHA256, ensureConfiguration } from '../helpers'

const NUXTHUB_SIGNATURE = 'x-nuxthub-signature'

/**
 * Validates NuxtHub webhooks on the Edge
 * @see {@link https://hub.nuxt.com/changelog/team-webhooks-env}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidNuxtHubWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('nuxthub', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const webhookSignature = headers[NUXTHUB_SIGNATURE]

  if (!body || !webhookSignature) return false

  const payload = body + config.secretKey
  const signatureBuffer = await subtle.digest(HMAC_SHA256.hash, encoder.encode(payload))
  const signature = Buffer.from(signatureBuffer).toString('hex')

  return signature === webhookSignature
}

/**
 * Alias for backwards compatibility
 * @deprecated Use `isValidNuxtHubWebhook` instead
 */
export const isValidNuxthubWebhook = isValidNuxtHubWebhook
