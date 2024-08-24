import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, hmacAlgorithm } from '../helpers'
import { useRuntimeConfig } from '#imports'

const MAX_VALID_TIME_DIFFERENCE = 5
const PADDLE_SIGNATURE = 'paddle-signature'

const extractHeaders = (header: string) => {
  const parts = header.split(';')
  let ts = ''
  let h1 = ''
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (value) {
      if (key === 'ts') ts = value
      else if (key === 'h1') h1 = value
    }
  }
  if (!(ts && h1)) return null
  return { ts: Number.parseInt(ts), h1 }
}

/**
 * Validates Paddle webhooks on the Edge
 * @see {@link https://github.com/PaddleHQ/paddle-node-sdk/blob/main/src/notifications/helpers/webhooks-validator.ts}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidPaddleWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { webhookId } = useRuntimeConfig(event).webhook.paddle

  const paddleSignature = headers[PADDLE_SIGNATURE]

  if (!body || !paddleSignature) return false

  const signatureHeaders = extractHeaders(paddleSignature)
  if (!signatureHeaders) return false
  const { ts: webhookTimestamp, h1: webhookSignature } = signatureHeaders

  if (new Date().getTime() > new Date((webhookTimestamp + MAX_VALID_TIME_DIFFERENCE) * 1000).getTime()) return false

  const payloadWithTime = `${webhookTimestamp}:${body}`

  const computedHash = await computeSignature(webhookId, hmacAlgorithm, payloadWithTime)
  return computedHash === webhookSignature
}
