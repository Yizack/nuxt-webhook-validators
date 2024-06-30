import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'

const DEFAULT_TOLERANCE = 300

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
 * Validates Stripe webhooks on the Edge \
 * Inspired by: https://docs.stripe.com/webhooks?verify=verify-manually
 * @async
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidStripeWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.stripe

  const STRIPE_SIGNATURE = 'Stripe-Signature'.toLowerCase()
  const stripeSignature = headers[STRIPE_SIGNATURE]

  if (!body || !stripeSignature) return false

  const signatureHeaders = extractHeaders(stripeSignature)
  if (!signatureHeaders) return false
  const { t: webhookTimestamp, v1: webhookSignature } = signatureHeaders

  if ((new Date().getTime() / 1000) - webhookTimestamp > DEFAULT_TOLERANCE) return false

  const payloadWithTime = `${webhookTimestamp}.${body}`
  const encoder = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }

  const key = await subtle.importKey('raw', encoder.encode(secretKey), algorithm, false, ['sign'])
  const hmac = await subtle.sign(algorithm.name, key, encoder.encode(payloadWithTime))

  const computedHash = Buffer.from(hmac).toString('hex')

  return computedHash === webhookSignature
}
