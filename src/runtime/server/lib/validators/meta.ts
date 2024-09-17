import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, hmacAlgorithm } from '../helpers'
import { useRuntimeConfig } from '#imports'

const META_SIGNATURE = 'X-Hub-Signature-256'.toLowerCase()

/**
 * Validates Meta webhooks on the Edge
 * @see {@link https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidMetaWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const { appSecret } = useRuntimeConfig(event).webhook.meta
  const signatureHeader = headers[META_SIGNATURE]

  if (!signatureHeader) return false
  const [prefix, webhookSignature] = signatureHeader.split('=')

  if (!body || prefix !== 'sha256' || !webhookSignature) return false

  const computedHash = await computeSignature(appSecret, hmacAlgorithm, body)
  return computedHash === webhookSignature
}
