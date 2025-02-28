import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'

const SVIX_SIGNATURE_ID = 'svix-id'
const SVIX_SIGNATURE = 'svix-signature'
const SVIX_SIGNATURE_TIMESTAMP = 'svix-timestamp'

/**
 * Validates Svix webhooks on the Edge
 * @see {@link https://docs.svix.com/receiving/verifying-payloads/how-manual}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidSvixWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('svix', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const webhookId = headers[SVIX_SIGNATURE_ID]
  const webhookSignature = headers[SVIX_SIGNATURE]
  const webhookTimestamp = headers[SVIX_SIGNATURE_TIMESTAMP]

  if (!body || !webhookId || !webhookSignature || !webhookTimestamp) return false

  const payload = `${webhookId}.${webhookTimestamp}.${body}`
  const secretKey = config.secretKey.split('_')[1]
  const signatureEntries = webhookSignature.split(' ')

  for (const signatureEntry of signatureEntries) {
    const signature = signatureEntry.split(',')[1]
    const computedBase64 = await computeSignature(secretKey, HMAC_SHA256, payload, { encoding: 'base64', decodeKey: true })
    if (computedBase64 === signature) return true
  }

  return false
}
