import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256 } from '../helpers'
import { useRuntimeConfig } from '#imports'

const DEFAULT_TOLERANCE = 300
const STRIPE_SIGNATURE = 'Stripe-Signature'.toLowerCase()

const extractHeaders = (header: string) => {
  const parts = header.split(',')
  let t = ''
  let v1 = ''
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (value) {
      if (key === 't') t = value
      else if (key === 'v1') v1 = value
    }
  }
  if (!(t && v1)) return null
  return { t: Number.parseInt(t), v1 }
}

/**
 * Validates Stripe webhooks on the Edge
 * @see {@link https://docs.stripe.com/webhooks?verify=verify-manually}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidStripeWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.stripe

  const stripeSignature = headers[STRIPE_SIGNATURE]

  if (!body || !stripeSignature) return false

  const signatureHeaders = extractHeaders(stripeSignature)
  if (!signatureHeaders) return false
  const { t: webhookTimestamp, v1: webhookSignature } = signatureHeaders

  if ((new Date().getTime() / 1000) - webhookTimestamp > DEFAULT_TOLERANCE) return false

  const payloadWithTime = `${webhookTimestamp}.${body}`

  const computedHash = await computeSignature(secretKey, HMAC_SHA256, payloadWithTime)
  return computedHash === webhookSignature
}
