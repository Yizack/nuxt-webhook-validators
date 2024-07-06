import { sha256 } from 'ohash'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'

const NUXTHUB_SIGNATURE = 'x-nuxthub-signature'

/**
 * Validates NuxtHub webhooks on the Edge
 * @see {@link https://hub.nuxt.com/changelog/team-webhooks-env}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidNuxthubWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.nuxthub

  const webhookSignature = headers[NUXTHUB_SIGNATURE]

  if (!body || !webhookSignature) return false

  const payload = body + secretKey
  const signature = sha256(payload)

  return signature === webhookSignature
}
